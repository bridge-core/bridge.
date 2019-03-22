//@ts-check
import Snippets from "../../../windows/Snippets";
import ProblemIterator from "./Problems";
import TabSystem from "../../TabSystem";
import { JSONAction } from "../../TabSystem/CommonHistory";

function run(code, self) {
    return (function(self, History, Unsaved){
        return eval(code);
    })(self, History, Unsaved);
}
function History(type, node, data) {
    TabSystem.getHistory().add(new JSONAction(type, node, data));
    TabSystem.setCurrentUnsaved();
}
function Unsaved() {
    TabSystem.setCurrentUnsaved();
}


export default class CommonProblem {
    constructor({ error_message, is_warning, fix }) {
        if(error_message) this.error_message = error_message;
        this.is_warning = is_warning;
        this.store_nodes = [];
        
        if(fix !== undefined) {
            if(fix.type === "snippet") {
                this.fix = {
                    function: () => {
                        Snippets.insert(fix.name, true);
                        ProblemIterator.repeatLast();
                    },
                    text: fix.display_text
                };
            } else if(fix.type === "script") {
                this.fix = {
                    function: (context) => {
                        run(fix.run, context);
                        ProblemIterator.repeatLast();
                    },
                    text: fix.display_text
                };
            }
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