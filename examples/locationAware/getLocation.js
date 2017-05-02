import isLocationValid from "./isLocationValid";

export default function getLocation(props = {}, context = {}) {
    const {router: {history} = {}} = context;
    const location = props.location || history.location;
    if (isLocationValid(location)) {
        return location;
    }
    return null;
}
