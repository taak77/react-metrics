/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {Router, Route, Switch, Link} from "react-router-dom";
import createHistory from "history/createHashHistory";
import {metrics, MetricsElement} from "react-metrics"; // eslint-disable-line import/no-unresolved
import MetricsConfig from "./metrics.config";
import Home from "./home";
import Page from "./page";
import locationAware from "../../locationAware/locationAware";

const history = createHistory();

class App extends Component {
    static displayName = "My Application";

    static propTypes = {
        children: PropTypes.node
    };

    render() {
        const link = (<Link to="/page/A" data-tracking-event-name="linkClick" data-tracking-value="A"><span>Page A</span></Link>);
        return (
            <div>
                <ul>
                    <li><MetricsElement><Link to="/" data-tracking-event-name="linkClick"><span>Home</span></Link></MetricsElement></li>
                    <li><MetricsElement element={link}><span>This span won't render</span></MetricsElement></li>
                    <li><MetricsElement to="/page/B" data-tracking-event-name="linkClick" data-tracking-value="B" element={Link}><span>Page B</span></MetricsElement></li>
                </ul>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route path="/page/:id" component={Page}/>
                    <Route component={NotFound}/>
                </Switch>
            </div>
        );
    }
}
const DecoratedApp = locationAware(metrics(MetricsConfig, {useTrackBinding: false, attributePrefix: "data-tracking"})(App));

class NotFound extends Component {
    render() {
        return (
            <h1>404!</h1>
        );
    }
}

ReactDOM.render((
    <Router history={history}>
        <DecoratedApp />
    </Router>
), document.getElementById("example"));
