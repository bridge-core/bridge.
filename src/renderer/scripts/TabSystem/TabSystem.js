//@ts-check
import CommonTab from "./CommonTab";

class TabSystem {
    constructor() {
        /**
         * @type {Array<CommonTab>}
         * @private
         */
        this.tabs = [];
        this.selected = 0;
    }
}

export default new TabSystem();