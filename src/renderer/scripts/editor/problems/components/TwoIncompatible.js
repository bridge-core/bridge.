//@ts-check
import CommonProblem from "../CommonProblem";

export default class TwoIncompatible extends CommonProblem {
    constructor({ first, second, ...other }) {
        //@ts-ignore
        super(other);
        this.first = first;
        this.second = second;
        this.first_found = false;
        this.second_found = false;
    }

    peek(node) {
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