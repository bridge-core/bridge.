//@ts-check
import CommonProblem from "../CommonProblem";
import JsonCacheUtils from "../../JSONCacheUtils";

export default class AnimationCheck extends CommonProblem {
    constructor({ ...other }) {
        //@ts-ignore
        super(other);
        this.problem_found = false;
        this.unknown_id = "";
    }

    peek(node) {
        if(node.parent !== undefined && node.parent.key === "animations") {
            console.log("Found")
            if(
                !JsonCacheUtils.animation_ids.includes(node.data)
                && !JsonCacheUtils.animation_controller_ids.includes(node.data)
            ) {
                this.problem_found = true;
                this.unknown_id = node.data;
                return true;
            }         
        }
        
        return false;
    }
    found() {
        return this.problem_found;
    }
    report() {
        this.error_message = "Unknown reference: " + this.unknown_id;
        let res = super.report();

        return res;
    }
    reset() {
        super.reset();
        this.problem_found = false;
    }
}