import React, {PropTypes} from "react";
import {exposeMetrics} from "react-metrics"; // eslint-disable-line import/no-unresolved
import matchPath from "react-router/matchPath";

@exposeMetrics
class User extends React.Component {
    static propTypes = {
        params: PropTypes.object
    };

    static willTrackPageView(routeState) {
        const {params} = matchPath(routeState.pathname, {path: "/user/:id"});
        return params;
    }

    render() {
        const {match: {params: {id}}} = this.props;
        return (
            <div className="User">
                <h1>User id: {id}</h1>
            </div>
        );
    }
}
export default User;
