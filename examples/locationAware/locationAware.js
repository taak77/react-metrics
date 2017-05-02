import React, {Component, PropTypes} from "react";
import hoistStatics from "hoist-non-react-statics";
import getHistory from "./getHistory";
import getLocation from "./getLocation";

function getDisplayName(Comp) {
    return Comp.displayName || Comp.name || "Component";
}

export default function locationAware(...args) {
    function wrap(ComposedComponent, {
        getHistory: oGetHistory,
        getLocation: oGetLocation,
        listenToHistory = false
    } = {}) {
		/**
         * This HOC passes `routeState` props down to the composed component which by default is the validated `location` object.
         * If it detects `router` context existence which has a capability of dispatching `location` object upon the route change,
         * `routeState` from the route change takes precedence.
         */
        class LocationAwareComponent extends Component {
            state = {
                location: null
            };

            static displayName = `LocationAwareComponent(${getDisplayName(ComposedComponent)})`;

            static contextTypes = {
                router: PropTypes.object
            };

            static propTypes = {
                /**
                 * A function to return a history object.
                 *
                 * @property getHistory
                 */
                getHistory: PropTypes.func,
                /**
                 * A function to return a location object.
                 *
                 * @property getLocation
                 */
                getLocation: PropTypes.func,
                /**
                 * A boolean to indicate whether the component should listen for history change event.
                 *
                 * @property listenToHistory
                 */
                listenToHistory: PropTypes.bool
            };

            static defaultProps = {
                getHistory: oGetHistory || getHistory,
                getLocation: oGetLocation || getLocation,
                listenToHistory
            };

            componentDidMount() {
                const {listenToHistory, getHistory} = this.props;
                if (!listenToHistory) {
                    return;
                }
                const history = getHistory(this.props, this.context);
                if (history) {
                    this._unlisten = history.listen(location => {
                        this.setState({location});
                    });
                }
            }

            componentWillUnmount() {
                if (this._unlisten) {
                    this._unlisten();
                }
            }

            render() {
                const {getLocation: pGetLocation, ...props} = this.props;
                const location = this.state.location || pGetLocation(this.props, this.context);
                return <ComposedComponent {...props} location={location} />;
            }
        }

        return hoistStatics(LocationAwareComponent, ComposedComponent);
    }

    if (typeof args[0] === "function") {
        return wrap(...args);
    }

    return target => {
        return wrap(target, ...args);
    };
}
