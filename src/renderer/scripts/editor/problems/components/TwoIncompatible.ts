//@ts-check
import CommonProblem, { ProblemConfig } from "../CommonProblem";
import JSONTree from "../../JsonTree";

export default class TwoIncompatible extends CommonProblem {
    first_found = false;
    second_found = false;
    first: string;
    second: string;

    constructor({ first, second, ...other }: ProblemConfig) {
        //@ts-ignore
        super(other);
        if(Array.isArray(first)) this.first = first[0];
        else this.first = first;
        this.second = second;
    }

    peek(node: JSONTree) {
        if(node.key === this.first) this.first_found = true;
        else if(node.key === this.second) this.second_found = true;
        else return false;
        return true;
    }
    found() {
        return this.first_found && this.second_found;
    }
    reset() {
        super.reset();
        this.first_found = false;
        this.second_found = false;
    }
} 