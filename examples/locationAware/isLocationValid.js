/**
 * `location` is a plain object which represents the current location in browser similar to document.location.
 *
 * @method isLocationValid
 * @param location
 * @returns {boolean}
 */
export default function isLocationValid(location = {}) {
    return location && location.hasOwnProperty("pathname");
}
