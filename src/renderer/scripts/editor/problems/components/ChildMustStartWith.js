//@ts-check
import CommonProblem from "../CommonProblem";

export default class ChildMustStartWith extends CommonProblem {
    constructor({ search, start, ...other }) {
        //@ts-ignore
        super(other);
        this.search = search;
        this.start = start;
        this.problem_found = false;
    }

    peek(node) {
        if(node.parent !== undefined && node.parent.key === this.search) {
            if(!node.key.startsWith(this.start)) {
                this.problem_found = true;
                return true;
            }
        }   
        return false;
    }
    found() {
        return this.problem_found;
    }
    reset() {
        super.reset();
        this.problem_found = false;
    }
}