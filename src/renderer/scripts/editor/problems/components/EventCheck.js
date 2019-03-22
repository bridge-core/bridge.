//@ts-check
import CommonProblem from "../CommonProblem";
import JsonCacheUtils from "../../JSONCacheUtils";
import TabSystem from "../../../TabSystem";

export default class EventCheck extends CommonProblem {
    constructor({ ...other }) {
        //@ts-ignore
        super(other);
        this.problem_found = false;
    }

    peek(node) {
        if(node.key === "event") {
            let t = node.parent.get("target");

            if(t === undefined || t === "self") {
                try {
                    let current_events = TabSystem.getSelected().content.get("minecraft:entity/events");
                    
                    if(!Object.keys(current_events.toJSON()).includes(node.data)) {
                        this.problem_found = true;
                        return true;
                    }
                } catch(e) {}
            } else {
                if(!JsonCacheUtils.events.includes(node.data)) {
                    this.problem_found = true;
                    return true;
                } 
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