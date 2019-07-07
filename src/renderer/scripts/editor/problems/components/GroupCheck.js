//@ts-check
import CommonProblem from "../CommonProblem";
import TabSystem from "../../../TabSystem";

export default class EntityGroupCheck extends CommonProblem {
    constructor({ ...other }) {
        //@ts-ignore
        super(other);
        this.problem_found = false;
    }

    peek(node) {
        if(node.parent === undefined) return false;
        if(node.parent.key === "component_groups" && node.path.includes("minecraft:entity/events")) {
            let groups = [];
            try {
                groups = TabSystem.getSelected().content.get("minecraft:entity/component_groups").children.map(c => c.key);
            } catch(e) {}
            
            if(node.data !== "" && !groups.includes(node.data)) {
                this.problem_found = true;
                return true;
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