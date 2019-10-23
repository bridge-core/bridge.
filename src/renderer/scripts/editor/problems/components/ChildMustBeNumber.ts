//@ts-check
import CommonProblem, { ProblemConfig } from "../CommonProblem";
import JSONTree from "../../JsonTree";

export default class ChildMustBeNumber extends CommonProblem {
    search: string;
    problem_found = false;

    constructor({ search, ...other }: ProblemConfig) {
        //@ts-ignore
        super(other);
        this.search = search;
    }

    peek(node: JSONTree) {
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