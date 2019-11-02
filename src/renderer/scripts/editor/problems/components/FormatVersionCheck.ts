//@ts-check
import CommonProblem, { ProblemConfig } from "../CommonProblem";
import FileType from "../../FileType";
import JSONTree from "../../JsonTree";

export default class FormatVersionCheck extends CommonProblem {
	search: string;
	format_version_found = false;
	found_error_node = false;
	
	constructor({ search, ...other }: ProblemConfig) {
		//@ts-ignore
		super(other);
		this.search = search;
	}

	peek(node: JSONTree) {
		if (
			node.key === "global" ||
			node.key === "minecraft:entity" ||
			(node.parent.key === "global" && FileType.get() === "biome")
		) {
			let n = node.get("format_version");
			if (n !== undefined && n.data !== "") {
				this.format_version_found = true;
			}
		}

		if (
			!this.found_error_node &&
			node.parent !== undefined &&
			node.parent.key === "global"
		) {
			this.found_error_node = true;
			return true;
		}
		return false;
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
