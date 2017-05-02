export default function getHistory(props = {}, context = {}) {
    const {router = {}} = context;
    const history = props.history || router.history;
    if (history && typeof history.listen === "function") {
        return history;
    }
    return null;
}
