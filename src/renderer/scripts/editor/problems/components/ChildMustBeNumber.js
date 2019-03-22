//@ts-check
import CommonProblem from "../CommonProblem";

export default class ChildMustBeNumber extends CommonProblem {
    constructor({ search, ...other }) {
        //@ts-ignore
        super(other);
        this.search = search;
        this.problem_found = false;
    }

    peek(node) {
        if(node.parent !== undefined && node.parent.key === this.search) {
            if(Number.isNaN(Number(node.key))) {
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