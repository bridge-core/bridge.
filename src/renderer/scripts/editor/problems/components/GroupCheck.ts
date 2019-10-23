//@ts-check
import CommonProblem from "../CommonProblem";
import TabSystem from "../../../TabSystem";
import JSONTree from "../../JsonTree";

export default class EntityGroupCheck extends CommonProblem {
    problem_found = false;

    constructor({ ...other }) {
        //@ts-ignore
        super(other);
    }

    peek(node: JSONTree) {
        if(node.parent === undefined) return false;
        if(node.parent.key === "component_groups" && node.path.includes("minecraft:entity/events")) {
            let groups: string[] = [];
            try {
                groups = TabSystem.getCurrentNavObj().get("minecraft:entity/component_groups").children.map(c => c.key);
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