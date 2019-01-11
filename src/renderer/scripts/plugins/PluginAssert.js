import AssertWindow from "../../windows/AssertWindow";
import Store from "../../store/index";

export default class Assert {
    static throw(plugin, err) {
        console.log(err.name, err.message, err.stack);
        
        if(Store.state.Settings.is_dev_mode) new AssertWindow(plugin, err.message);
    }
}