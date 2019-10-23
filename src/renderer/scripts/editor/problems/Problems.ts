//@ts-check
import FileType from "../FileType";
import PROBLEM_STORE from "./components";
import Store from "../../../store/index";
import EventBus from "../../EventBus";
import TabSystem from "../../TabSystem";
import JSONTree from "../JsonTree";

EventBus.on("updateSelectedTab", () => {
    let tree;
    if(TabSystem.getSelected()) tree = TabSystem.getSelected().content;
    if(tree instanceof JSONTree) ProblemIterator.findProblems(tree);
});

class ProblemIterator {
    static last_tree: JSONTree;
    
    static async findProblems(node_tree: JSONTree, file_path?: string) {
        if(this.last_tree !== node_tree) this.last_tree = node_tree;
        
        let arr = (await PROBLEM_STORE())[FileType.get(file_path)];
        if(arr === undefined) return;
        arr.forEach(p => p.reset());

        if(Store.state.Settings.when_error === "Never") return;

        for(let node of node_tree) {
            arr.forEach(p => p.processPeek(node));
        }

        return arr.map(p => p.report());
    }

    static repeatLast() {
        if(this.last_tree !== undefined) this.findProblems(this.last_tree);
    }
}


export default ProblemIterator;