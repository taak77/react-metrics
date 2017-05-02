/* eslint-disable react/no-multi-comp, max-nested-callbacks, react/prop-types, no-empty, padded-blocks */
import React from "react";
import ReactDOM from "react-dom";
import createHistory from "history/createMemoryHistory";
import {Router, Route} from "react-router";
import metrics from "../../src/react/metrics";
import exposeMetrics, {getMountedInstances} from "../../src/react/exposeMetrics";
import MetricsConfig from "../metrics.config";

describe("exposeMetrics", () => {
    let node;

    beforeEach(() => {
        node = document.createElement("div");
        MetricsConfig.autoTrackPageView = false;
    });

    afterEach(() => {
        try {
            ReactDOM.unmountComponentAtNode(node);
        } catch (err) {}
        MetricsConfig.autoTrackPageView = true;
    });

    it("should be named after wrapped component", () => {
        class Comp1 extends React.Component {
            static displayName = "Compo1";
            render() {
                return (<h1>Page</h1>);
            }
        }

        let Metrics = exposeMetrics(Comp1);

        expect(Metrics.displayName).to.be.equal("Metrics(Compo1)");

        class Comp2 extends React.Component {
            render() {
                return (<h1>Page</h1>);
            }
        }

        Metrics = exposeMetrics(Comp2);

        expect(Metrics.displayName).to.be.equal("Metrics(Comp2)");

        const Comp3 = React.createClass({
            render() {
                return (<h1>Page</h1>);
            }
        });

        Metrics = exposeMetrics(Comp3);

        expect(Metrics.displayName).to.be.equal("Metrics(Comp3)");

        const Comp4 = React.createClass({
            displayName: null,
            render() {
                return (<h1>Page</h1>);
            }
        });

        Metrics = exposeMetrics(Comp4);

        expect(Metrics.displayName).to.contains("Metrics(");
    });

    it("should provide 'willTrackPageView' static method to route handler component", (done) => {
        const history = createHistory();

        @metrics(MetricsConfig)
        class Application extends React.Component {
            render() {
                return (<div><Route path="/page/:id" component={Page}/></div>);
            }
        }

        @exposeMetrics
        class Page extends React.Component {
            static displayName = "Page";

            static willTrackPageView() {
                expect(true).to.be.ok;
                done();
            }

            render() {
                return (<h1>Page</h1>);
            }
        }

        ReactDOM.render((
            <Router history={history}>
                <Route path="/" component={Application} />
            </Router>
        ), node, function () {
            history.push("/page/1");
        });
    });

    it("should support partial application", (done) => {
        const history = createHistory();

        @metrics(MetricsConfig)
        class Application extends React.Component {
            render() {
                return (<div><Route path="/page/:id" component={Page}/></div>);
            }
        }

        @exposeMetrics()
        class Page extends React.Component {

            static willTrackPageView() {
                expect(true).to.be.ok;
                done();
            }

            render() {
                return (<h1>Page</h1>);
            }
        }

        ReactDOM.render((
            <Router history={history}>
                <Route path="/" component={Application} />
            </Router>
        ), node, function () {
            history.push("/page/1");
        });
    });

    it("should register itself to a registry when mounting, unregister itself from a registry when unmounting", (done) => {
        @exposeMetrics
        class Application extends React.Component {
            render() {
                return (<div>Application</div>);
            }
        }

        ReactDOM.render((
            <Application />
        ), node, function () {
            const registry = getMountedInstances();
            expect(registry).to.have.length(1);
            ReactDOM.unmountComponentAtNode(node);
            expect(registry).to.have.length(0);
            done();
        });
    });
});
