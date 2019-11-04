/**
 * Uses the Tokenizer to parse auto-completion statements
 * 
 * e.g. "('prefix:' + $example.identifier) and $example.prefixed_identifiers)
 */
import { Tokenizer } from "./Tokenizer";
import { detachMerge } from "../mergeUtils";
import { LIB } from "./Provider";

interface OmegaResult {
    object?: any;
    value?: string[];
}

const OPS = [ "+", "and", "asValue" ];

export class Omega {
    static eval(str: string, value_cast=false) {
        let tokens = Tokenizer.parse(str);
        let res: OmegaResult = {
            object: {},
            value: []
        };
        let prefix = "";
        let i = 0;

        while(i < tokens.length) {
            let { type, data } = tokens[i];
            let { data: prev_data } = tokens[i - 1] || {};

            if(data[0] === "'" && data[data.length - 1] === "'") {
                prefix += data.substring(1, data.length - 1);
                if(tokens[i + 1].data !== "+") throw new Error("Expected '+' operator after prefix definition");
            } else if(type === "NESTED") {
                this.combine(res, this.eval(data, value_cast || prev_data === "asValue"), prefix);
                prefix = "";
            } else if(!OPS.includes(data)) {
                this.combine(res, this.dynamic(data, value_cast || prev_data === "asValue"), prefix);
                prefix = "";
            } else if(data === "+" && prefix === "") {
                if(!prev_data) throw new Error("Expected prefix definition before '+' operator");
                prefix = this.walk(prev_data);
            }

            i++;
        }
        return res;
    }

    static combine(original: OmegaResult, { object, value }: OmegaResult, prefix=""): OmegaResult {
        if(object === undefined && value === undefined) return;

        if(prefix === "") {
            original.value.push(...value);
            original.object = detachMerge(original.object, object);
        } else {
            let new_value = value.map(v => prefix + v);
            let new_object: any = {};
            for(let key in object) {
                new_object[prefix + key] = object[key];
            }

            return this.combine(original, { value: new_value, object: new_object });
        }
    }

    static dynamic(expression: string, value_cast=false) {
        let w = this.walk(expression);
        if(w === undefined) return {};

        if(typeof w === "string") {
            return this.eval(w, value_cast);
        } else if(Array.isArray(w)) {
            return { value: w, object: {} };
        } else {
            if(value_cast) return { value: Object.keys(w).filter(k => k !== "@meta"), object: {} };
            return { value: [], object: w };
        }
    }

    static walk(expression: string) {
        if(expression === undefined) return;
        let path = expression.substring(1, expression.length).split(".");
        let current: any = LIB;
        while(path.length > 0 && current !== undefined) {
            current = current[path.shift().replace(/\&dot\;/g, ".")];
            if(typeof current === "function") current = current();
        }

        return current;
    }
}