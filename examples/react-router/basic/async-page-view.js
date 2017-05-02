import React from "react";
import {PropTypes, exposeMetrics} from "react-metrics"; // eslint-disable-line import/no-unresolved
import queryString from "query-string";

@exposeMetrics
class AsyncPageView extends React.Component {
    static contextTypes = {
        metrics: PropTypes.metrics
    };

    static willTrackPageView(routeState) {
        return AsyncPageView._promise.then(result => {
            return Object.assign({}, result, queryString.parse(routeState.search));
        });
    }

    static _promise = new Promise(resolve => {
        setTimeout(() => {
            resolve({
                asyncMetrics: "asyncValue"
            });
        }, 5 * 1000);
    });

    render() {
        return <h1>Async Page View Example</h1>;
    }
}

export default AsyncPageView;
