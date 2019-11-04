import AssertWindow from "../../windows/AssertWindow";
import Store from "../../store/index";

window.addEventListener("error", (ev) => {
    Assert.throw("bridge. core", ev.error, ev.message);
});

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    Assert.throw("bridge. core", undefined, event.reason);
};

export default class Assert {
    /**
     * Throws a new assert and opens assertion window if activated
     * @param {String} plugin Plugin which caused the error
     * @param {Error} err Error to show inside assertion window
     * @param {String | Event} message
     */
    static throw(plugin: string, err?: Error, message=err.message) {
        // console.log(err.name, err.message, err.stack);
        if(Store.state.Settings.is_dev_mode) new AssertWindow(plugin, message);
        else if(err) console.error(err);
    }
}