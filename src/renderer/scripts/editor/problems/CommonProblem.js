//@ts-check
import Snippets from "../../../windows/Snippets";
import ProblemIterator from "./Problems";

export default class CommonProblem {
    constructor({ error_message, is_warning, fix }) {
        if(error_message) this.error_message = error_message;
        this.is_warning = is_warning;
        this.store_nodes = [];
        
        if(fix && fix.type === "snippet") {
            this.fix = {
                function: () => {
                    Snippets.insert(fix.name, true);
                    ProblemIterator.repeatLast();
                },
                text: fix.display_text
            };
        }
    }

    processPeek(node) {
        if(this.peek(node)) this.store_nodes.push(node);
    }

    /**
     * Look at a node and process it
     * @param {*} node 
     */
    peek(node) {
        return false;
    }
    /**
     * Report of a problem
     */
    report() {
        if(this.found()) this.updateNodes();
        return {
            found: this.found(),
            error_message: this.error_message
        };
    }
    found() {
        return false;
    }

    updateNodes() {
        this.store_nodes.forEach(node => node.error = {
            is_warning: this.is_warning,
            show: true,
            message: this.error_message,
            fix: this.fix
        });
    }
    clearNodes() {
        this.store_nodes.forEach(node => node.error = undefined);
    }

    /**
     * Reset the component
     */
    reset() {
        this.clearNodes();
        this.store_nodes = [];
    }
}