// @ts-check
import { History } from "./CommonHistory";
import TabSystem from "./TabSystem";

export default class CommonTab {
    /**
     * @param {TabSystem} parent
     * @param {String} project
     * @param {String} content
     */
    constructor(parent, project, content) {
        this.parent = parent;
        this.content = content;
        this.history = new History();
        this.file_navigation = "global";
        this.project = project;
        this.is_unsaved = false;
        this.uuid = `${project}-${Math.random()}-${Math.random()}`;
    }

    /**
     * Getting the save content of a file
     * @abstract
     * @returns {String}
     */
    getSaveContent() {
        return "";
    }

    /**
     * Cut
     * @abstract
     * @returns {Boolean} Whether cutting was successful
     */
    cut() {
        return false;
    }
    /**
     * Copy
     * @abstract
     * @returns {Boolean} Whether copying was successful
     */
    copy() {
        return false;
    }  
    /**
     * Paste
     * @abstract
     * @param {String} content Content to paste
     * @returns {Boolean} Whether pasting was successful
     */
    paste(content) {
        return false;
    }
}