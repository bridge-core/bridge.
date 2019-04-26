// @ts-check
import Store from "../../store/index";
import ProblemIterator from "../editor/problems/Problems";

/**
 * @class History
 */
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

    updateError() {
        if(Store.state.Settings.when_error === "On File Change") {
            setTimeout(() => ProblemIterator.repeatLast(), 10);
        }
    }

    /**
     * Adds an action to the undo queue
     * @param {Action} action Action to add to the undo queue
     */
    add(action) {
        this.updateError();

        if(this.undo_arr.length == 0) return this.undo_arr.unshift(action);
        this.undo_arr[0].push(this.undo_arr, action);
    }

    /**
     * Commits an undo-action
     */
    undo() {
        let undo = this.undo_arr.shift();
        if(undo == undefined) return false;

        this.redo_arr.unshift(undo.reverse());
        undo.commit();
        TabSystem.setCurrentFileNav("global");
        TabSystem.setCurrentUnsaved();

        this.updateError();
        return true;
    }
    /**
     * Commits a redo-action
     */
    redo() {
        let redo = this.redo_arr.shift();
        if(redo == undefined) return false;

        this.undo_arr.unshift(redo.reverse());
        redo.commit();
        TabSystem.setCurrentFileNav("global");
        TabSystem.setCurrentUnsaved();

        this.updateError();
        return true;
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
    /**
     * Called on first object in "arr" upon trying to push a new action
     * @abstract
     * @param {Array<Action>} arr
     * @param {Action} action
     */
    push(arr, action) {}
}

/**
 * @typedef {"add"|"remove"|"edit-key"|"edit-data"} CommitType
 * 
 * @typedef {Object} JSONTree
 * @property {Function} buildFromObject
 * @property {Function} updateUUID
 * @property {Function} removeNode
 * @property {Function} add
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
        if(this.type == "add") this.context.add(this.data);
        else if(this.type == "remove") this.context.removeNode(this.data);
        else if(this.type == "edit-key") {
            this.context.key = this.data;
            TabSystem.setCurrentFileNav("global");
        } else if(this.type == "edit-data") {
            this.context.data = this.data;
            TabSystem.setCurrentFileNav("global");
        }
        this.context.updateUUID();
        return this;
    }

    reverse() {
        if(this.type == "add") return new JSONAction("remove", this.context, this.data);
        else if(this.type == "remove") return new JSONAction("add", this.context, this.data);
        else if(this.type == "edit-key") return new JSONAction("edit-key", this.context, this.context.key);
        else if(this.type == "edit-data") return new JSONAction("edit-data", this.context, this.context.data);
    }

    push(arr, action) {
        if(
            action.context === this.context 
            && action.type === this.type 
            && (this.type == "edit-key" || this.type == "edit-data")
        ) {
            return;
        } else {
            arr.unshift(action);
        }
    }
}