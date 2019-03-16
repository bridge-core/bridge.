//@ts-check
import CommonProblem from "../CommonProblem";

export default class NeedsBoth extends CommonProblem {
    constructor({ first, second, ...other }) {
        //@ts-ignore
        super(other);
        if(Array.isArray(first)) this.first = first;
        else this.first = [first];

        this.second = second;
        this.first_found = false;
        this.second_found = false;
    }

    peek(node) {
        if(this.first.includes(node.key)) this.first_found = true;
        else if(node.key === this.second) this.second_found = true;
        else return false;
        return true;
    }
    found() {
        return !this.first_found || !this.second_found;
    }
    report() {
        let old = this.error_message;
        this.error_message = this.error_message.replace(/\$failure_name/g, !this.first_found ? this.first.join(" or ") : this.second);
        let res = super.report();   
        this.error_message = old;

        return res;
    }
    reset() {
        super.reset();
        this.first_found = false;
        this.second_found = false;
    }
}