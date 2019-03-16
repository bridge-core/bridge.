//@ts-check
import CommonProblem from "../CommonProblem";

export default class NeedsThreeIfBoth extends CommonProblem {
    constructor({ first, second, third, ...other }) {
        //@ts-ignore
        super(other);

        if(Array.isArray(first)) this.first = first;
        else this.first = [first];
        this.second = second;
        this.third = third;

        this.first_found = false;
        this.second_found = false;
        this.third_found = false;
    }

    peek(node) {
        if(this.first.includes(node.key)) this.first_found = true;
        else if(node.key === this.second) this.second_found = true;
        else if(node.key === this.third) this.third_found = true;
        else return false;
        return true;
    }
    onePresent() {
        return this.first_found || this.second_found;
    }
    found() {
        return this.first_found && this.second_found && !this.third_found;
    }
    report() {
        if(!this.found()) return super.report();
        
        let old = this.error_message;
        this.error_message = this.error_message.replace(/\$failure_name/g, this.third);
        let res = super.report();   
        this.error_message = old;

        return res;
    }
    reset() {
        super.reset();
        this.first_found = false;
        this.second_found = false;
        this.third_found = false;
    }
}