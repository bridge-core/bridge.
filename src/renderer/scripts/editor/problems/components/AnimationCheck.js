//@ts-check
import CommonProblem from "../CommonProblem";
import LightningCache from "../../LightningCache";

export default class AnimationCheck extends CommonProblem {
    constructor({ ...other }) {
        //@ts-ignore
        super(other);
        this.problem_found = false;
        this.unknown_id = "";
        this.ids = undefined;
    }

    peek(node) {
        if(this.ids === undefined) {
            let c = LightningCache.getCompiledSync();
            if(c.animation !== undefined && c.animation_controller !== undefined) {
                this.ids = c.animation.ids.concat(c.animation_controller.ids);
            } else if(c.animation !== undefined || c.animation_controller !== undefined) {
                this.ids = c.animation ? c.animation.id : c.animation_controller.ids;
            } else {
                this.ids = [];
            }
        } 
        if(node.parent !== undefined && node.parent.key === "animations") {
            if(!this.ids.includes(node.data)) {
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
        this.ids = undefined;
    }
}