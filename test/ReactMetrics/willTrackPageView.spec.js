/* eslint-disable react/no-multi-comp, max-nested-callbacks, react/prop-types, padded-blocks */
import React from "react";
import ReactDOM from "react-dom";
import createHistory from "history/createMemoryHistory";
import {Router, Route} from "react-router";
import metrics from "../../src/react/metrics";
import exposeMetrics from "../../src/react/exposeMetrics";
import MetricsConfig from "../metrics.config";
import metricsMock from "../metricsMock";

describe("willTrackPageView", () => {
    let node;

    beforeEach(() => {
        node = document.createElement("div");
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(node);
    });

    it("is called after 'componentDidMount' and 'componentDidUpdate'", done => {
        const history = createHistory({initialEntries: ["/page/content"]});
        let componentWillMountCalled = false;
        let componentDidMountCalled = false;
        let componentWillReceivePropsCalled = false;
        let componentDidUpdateCalled = false;
        let willTrackPageViewCount = 0;

        @metrics(MetricsConfig)
        class Application extends React.Component {
            static displayName = "Application";

            render() {
                return (
                    <div>
                        <h1>Application</h1>
                        <Route path="/page" component={Page} />
                    </div>
                );
            }
        }

        class Page extends React.Component {
            static displayName = "Page";

            render() {
                return (<div><h2>Page</h2><Route path="/page/:content" component={Content}/></div>);
            }
        }

        @exposeMetrics
        class Content extends React.Component {
            static displayName = "Content";

            componentWillMount() {
                componentWillMountCalled = true;
            }

            componentDidMount() {
                componentDidMountCalled = true;
            }

            componentWillReceiveProps() {
                componentWillReceivePropsCalled = true;
            }

            componentDidUpdate() {
                componentDidUpdateCalled = true;
            }

            static willTrackPageView() {
                if (willTrackPageViewCount === 0) {
                    expect(componentWillMountCalled).to.equal(true);
                    expect(componentDidMountCalled).to.equal(true);
                } else if (willTrackPageViewCount === 1) {
                    expect(componentWillReceivePropsCalled).to.equal(true);
                    expect(componentDidUpdateCalled).to.equal(true);
                    done();
                }
                willTrackPageViewCount++;
            }

            render() {
                return (<h3>Content</h3>);
            }
        }

        ReactDOM.render((
            <Router history={history}>
                <Route component={Application} />
            </Router>
        ), node, function () {history.push("/page/content2");});
    });

    it("cancels page view tracking when returns 'false'.", done => {
        @metrics(MetricsConfig)
        @exposeMetrics
        class Application extends React.Component {
            static displayName = "Application";

            static willTrackPageView() {
                return false;
            }

            render() {
                return (<div>{this.props.children}</div>);
            }
        }

        const mock = sinon.mock(metricsMock.api);
        const pageView = sinon.stub(Application.prototype, "_getMetrics", () => {
            return metricsMock;
        });
        mock.expects("pageView").never();

        ReactDOM.render((
            <Router history={createHistory("/")}>
                <Route path="/" component={Application}/>
            </Router>
        ), node, () => {
            mock.verify();
            mock.restore();
            pageView.restore();
            done();
        });
    });

    it("can accpets object", done => {
        @metrics(MetricsConfig)
        @exposeMetrics
        class Application extends React.Component {
            static displayName = "Application";

            static willTrackPageView() {
                return {
                    prop1: "value1"
                };
            }

            render() {
                return (<div>{this.props.children}</div>);
            }
        }

        const pageView = sinon.stub(Application.prototype, "_getMetrics", () => {
            return {
                ...metricsMock,
                api: {
                    pageView(...args) {
                        expect(typeof args[0]).to.be.equal("object");
                        pageView.restore();
                        done();
                    }
                }
            };
        });

        ReactDOM.render((
            <Router history={createHistory("/")}>
                <Route path="/" component={Application}/>
            </Router>
        ), node);
    });

    it("receives 'routeState' object with expected props and values", done => {
        const state = {isModal: false};
        const history = createHistory();

        @metrics(MetricsConfig)
        class Application extends React.Component {
            static displayName = "Application";

            render() {
                return (<div><Route path="/page/:id" component={Page}/></div>);
            }
        }

        @exposeMetrics
        class Page extends React.Component {
            static displayName = "Page";

            static willTrackPageView(routeState) {
                expect(routeState.pathname).to.equal("/page/123");
                expect(routeState.search).to.equal("?param1=value1");
                expect(routeState.hash).to.equal("");
                expect(JSON.stringify(routeState.state)).to.equal(JSON.stringify(state));
                done();
                return true;
            }

            render() {
                return (<div><h2>Page</h2>{this.props.children}</div>);
            }
        }

        ReactDOM.render((
            <Router history={history}>
                <Route component={Application} />
            </Router>
        ), node, function () {
            history.push("/page/123?param1=value1", state);
        });
    });
});
