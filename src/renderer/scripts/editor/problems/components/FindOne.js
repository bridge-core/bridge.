//@ts-check
import CommonProblem from "../CommonProblem";

export default class FindOne extends CommonProblem {
    constructor({ search, ...other }) {
        //@ts-ignore
        super(other);
        this.search = search;
        this.search_found = false;
    }

    peek(node) {
        if(node.key === this.search) this.search_found = true;
        else return false;
        return true;
    }
    found() {
        return this.search_found;
    }
    reset() {
        super.reset();
        this.search_found = false;
    }
}