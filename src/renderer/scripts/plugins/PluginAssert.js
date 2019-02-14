// @ts-check
import AssertWindow from "../../windows/AssertWindow";
import Store from "../../store/index";

export default class Assert {
    /**
     * Throws a new assert and opens assertion window if activated
     * @param {String} plugin Plugin which caused the error
     * @param {Error} err Error to show inside assertion window
     */
    static throw(plugin, err) {
        // console.log(err.name, err.message, err.stack);
        if(Store.state.Settings.is_dev_mode) new AssertWindow(plugin, err.message);
        else console.error(err);
    }
}