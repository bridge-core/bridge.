//@ts-check
import FileType from "../FileType";
import PROBLEM_STORE from "./components";

class ProblemIterator {
    static findProblems(node_tree, file_path) {
        if(this.last_tree !== node_tree) this.last_tree = node_tree;

        let arr = PROBLEM_STORE[FileType.get(file_path)];
        arr.forEach(p => p.reset());

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