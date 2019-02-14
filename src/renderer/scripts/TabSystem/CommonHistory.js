// @ts-check
export class Action {
    /**
     * Commits an action & returns current action object
     * @abstract
     * @returns {Action}
     */
    commit() {
        return this;
    }
    /**
     * Creates a new action object which has the opposite effect of the calling object
     * @abstract
     * @returns {Action}
     */
    reverse() {
        return new Action();
    }
}

/**
 * @typedef {"add"|"remove"|"edit-key"|"edit-data"} CommitType
 * 
 * @typedef {Object} JSONTree
 * @property {Function} buildFromObject
 * @property {Function} removeByObject
 * @property {String} path
 * @property {String} key
 * @property {String} data
 */
export class JSONAction extends Action {
    /**
     * @param {JSONTree} context 
     * @param {CommitType} type
     * @param {any} data
     */
    constructor(type, context, data) {
        super();
        this.type = type;
        this.context = context;
        this.data = data;
    }

    commit() {
        if(this.type == "add") this.context.buildFromObject(this.data);
        else if(this.type == "remove") this.context.removeByObject(this.data);
        else if(this.type == "edit-key") this.context.key = this.data;
        else if(this.type == "edit-data") this.context.data = this.data;
        return this;
    }

    reverse() {
        if(this.type == "add") return new JSONAction("remove", this.context, this.data);
        else if(this.type == "remove") return new JSONAction("add", this.context, this.data);
        else if(this.type == "edit-key") return new JSONAction("edit-key", this.context, this.context.key);
        else if(this.type == "edit-data") return new JSONAction("edit-key", this.context, this.context.data);
    }
}

export class History {
    constructor() {
        /**
         * @type {Array<Action>}
         * @private
         */
        this.undo_arr = [];
        /**
         * @type {Array<Action>}
         * @private
         */
        this.redo_arr = [];
    }

    /**
     * Adds an action to the undo queue
     * @param {Action} action Action to add to the undo queue
     */
    add(action) {
        this.undo_arr.push(action);
    }

    /**
     * Commits an undo-action
     */
    undo() {
        let undo = this.undo_arr.shift();
        this.redo_arr.unshift(undo.reverse());
        undo.commit();
    }
    /**
     * Commits a redo-action
     */
    redo() {
        let redo = this.redo_arr.shift();
        this.undo_arr.unshift(redo.reverse());
        redo.commit();
    }

    /**
     * Clears the current history
     */
    clear() {
        this.undo_arr = [];
        this.redo_arr = [];
    }
    /**
     * Clears the current undo history
     */
    clearUndo() {
        this.undo_arr = [];
    }
    /**
     * Clears the current redo history
     */
    clearRedo() {
        this.redo_arr = [];
    }
}