//@ts-check
import CommonProblem from "../CommonProblem";

export default class FormatVersionCheck extends CommonProblem {
    constructor({ search, ...other }) {
        //@ts-ignore
        super(other);
        this.search = search;
        this.format_version_found = false;
        this.found_error_node = false;
    }

    peek(node) {
        if(node.key === "global" || node.key === "minecraft:entity") {
            let n = node.get("format_version");
            if(n !== undefined && n.data !== "") {
                this.format_version_found = true;
            }
        }

        if(!this.found_error_node && node.parent !== undefined && node.parent.key === "global") {
            this.found_error_node = true;
            return true;
        } 
        else return false;
    }
    found() {
        return !this.format_version_found;
    }
    reset() {
        super.reset();
        this.format_version_found = false;
        this.found_error_node = false;
    }
}