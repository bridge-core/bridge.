//@ts-check
import CommonProblem from "../CommonProblem";
import LightningCache from "../../LightningCache";
import JSONTree from "../../JsonTree";

export default class AnimationCheck extends CommonProblem {
    problem_found = false;
    unknown_id = "";
    ids: string[];

    constructor({ ...other }) {
        //@ts-ignore
        super(other);
    }

    peek(node: JSONTree) {
        if(this.ids === undefined) {
            let c = LightningCache.getCompiledSync();
            if(c.animation !== undefined && c.animation_controller !== undefined) {
                this.ids = c.animation.ids.concat(c.animation_controller.ids);
            } else if(c.animation !== undefined || c.animation_controller !== undefined) {
                this.ids = c.animation ? c.animation.id : c.animation_controller.ids;
            } 
            if(this.ids === undefined)
                this.ids = [];
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