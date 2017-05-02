/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {HashRouter as Router, Route, Switch, NavLink} from "react-router-dom";
import {metrics} from "react-metrics"; // eslint-disable-line import/no-unresolved
import MetricsConfig from "./metrics.config";
import Home from "./home";
import AsyncPageView from "./async-page-view";
import ManualPageView from "./manual-page-view";
import User from "./user";
import locationAware from "../../locationAware/locationAware";

class NotFound extends Component {
    render() {
        return (
            <h1>404!</h1>
        );
    }
}

class App extends Component {
    static displayName = "My Application";

    static propTypes = {
        children: PropTypes.node
    };

    static isActive(hasParam, match, location) {
        if (!match ||
            location.search && !hasParam ||
            !location.search && hasParam) {
            return false;
        }

        return true;
    }

    render() {
        return (
            <div>
                <ul>
                    <li><NavLink exact to="/">Home</NavLink></li>
                    <li><NavLink to="/async" isActive={App.isActive.bind(App, false)}>Async Page View Track</NavLink></li>
                    <li><NavLink to={{pathname: "/async", search: '?param=abc'}} isActive={App.isActive.bind(App, true)}>Async Page View Track with query param</NavLink></li>
                    <li><NavLink to="/manual">Manual Page View Track</NavLink></li>
                    <li><NavLink to="/user/123">Page View Track with params</NavLink></li>
                </ul>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route path="/async" component={AsyncPageView}/>
                    <Route path="/manual" component={ManualPageView}/>
                    <Route path="/user/:id" component={User}/>
                    <Route component={NotFound}/>
                </Switch>
            </div>
        );
    }
}
const DecoratedApp = locationAware(metrics(MetricsConfig)(App));

ReactDOM.render((
    <Router>
        <DecoratedApp />
    </Router>
), document.getElementById("example"));
