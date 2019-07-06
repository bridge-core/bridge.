//@ts-check
import CommonProblem from "../CommonProblem";

export default class BehaviorCheck extends CommonProblem {
    constructor({ ...other }) {
        //@ts-ignore
        super(other);
        this.found_behavior = false;
        this.found_pathfinder = false;
        this.found_movement = false;
    }

    peek(node) {
        if(node.key.startsWith("minecraft:behavior.")) {
            this.found_behavior = true;
            return true;          
        } else if(node.key.startsWith("minecraft:navigation.")) {
            this.found_pathfinder = true;
        } else if(node.key.startsWith("minecraft:movement.")) {
            this.found_movement = true;
        }
        
        return false;
    }
    found() {
        return this.found_behavior && (!this.found_movement || !this.found_pathfinder);
    }
    report() {
        let old = this.error_message;
        this.error_message = this.error_message.replace(/\$failure_name/g, !this.found_pathfinder ? "minecraft:navigation.<type>" : "minecraft:movement.<type>");
        let res = super.report();   
        this.error_message = old;

        return res;
    }
    reset() {
        super.reset();
        this.found_behavior = false;
        this.found_pathfinder = false;
        this.found_movement = false;
    }
}