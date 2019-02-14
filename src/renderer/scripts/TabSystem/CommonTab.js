// @ts-check
export default class CommonTab {
    /**
     * Getting the save content of a file
     * @abstract
     * @returns {String}
     */
    getSaveContent() {
        return "";
    }

    /**
     * Undo
     * @abstract
     */
    undo() {

    }
    /**
     * Redo
     * @abstract
     */
    redo() {

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