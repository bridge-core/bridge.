/**
 * Implements a JSONTree
 * Used for storing JSON data and displaying JSON files
 */
import Stack from "../utilities/Stack";
import Json from "./Json";
import Provider from "../autoCompletions/Provider";
import PluginEnv from "../plugins/PluginEnv";
import TabSystem from "../TabSystem";
import { JSONAction } from "../TabSystem/CommonHistory";
import FileType from "./FileType";
import uuidv4 from "uuid/v4";
import Store from "../../store/index";
import CommonProblem from "./problems/CommonProblem";
let PROVIDER: Provider;

function getType(data: any) {
    if(Array.isArray(data)) return "array";
    return typeof data;
}
export function changeProvider(new_path: string) {
    if(PROVIDER === undefined) PROVIDER = new Provider("");
    PROVIDER.validator(new_path);
}

export class TreeIterator {
    stack: Stack<{ node: JSONTree; step: number; }>;

    constructor(tree: JSONTree) {
        this.stack = new Stack();
        this.descendAndPush(tree, 0);
    }
    next(max_depth?: number) {
        let stack_e = this.stack.pop();
        if(this.hasNext()) this.descendAndPush(this.stack.peek().node, stack_e.step + 1, max_depth);
        return stack_e.node;
    }
    hasNext() {
        return !this.stack.isEmpty();
    }

    descendAndPush(root: JSONTree, step: number, max_depth=Infinity) {
        let current = root;

        //Go one layer back (next sibling)
        if(current && current.children[step] && step != 0) {
            current = current.children[step];
            this.stack.push({ node: current, step });
            this.descendAndPush(current.children[0], 0);
        } else if(step == 0) {
            //Go further down
            while(current != undefined && this.stack.size < max_depth) {
                this.stack.push({ node: current, step });
                current = current.children[step];
            }
        }
    }
}

export default class JSONTree {
    internal_key: string;
    data: string;
    children: JSONTree[];
    open: boolean;
    type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array";
    parent?: JSONTree;
    comment: string;
    propose_cache: any;
    propose_cache_uses: number;
    mark_color?: string;
    error?: any;
    uuid: string;
    meta: any;

    constructor(key="", data="", parent?: JSONTree, children: JSONTree[]=[], open=false) {
        this.internal_key = key + "";
        this.data = data + "";
        this.children = children;
        this.open = open;
        this.type = "object";
        this.parent = parent;
        this.comment = "";
        this.propose_cache = {};
        this.propose_cache_uses = 0;
        this.mark_color = undefined;
        this.error = undefined;
        this.uuid = uuidv4();
        this.meta = {};
    }
    get is_array() {
        let d = FileType.getData();
        // INCLUDE BUILD ARRAY EXCEPTIONS IF ABLE TO ACCESS DATA
        if(d !== undefined) {
            return this.children.length > 0 && this.only_numerical_children 
                && (d.build_array_exceptions === undefined || !d.build_array_exceptions.includes(this.internal_key));
        }

        return this.children.length > 0 && this.only_numerical_children;
    }
    get only_numerical_children() {
        for(let c of this.children) {
            if(Number.isNaN(Number(c.internal_key)))
                return false;
        }
        return true;
    }

    //THIN WRAPPER AROUND KEY ATTR FOR BETTER ARRAY SUPPORT
    get key() {
        if(this.parent !== undefined && this.parent.is_array) {
            let k = `${this.parent.find(this)}`;
            if(this.internal_key !== k && k !== "-1") {
                this.internal_key = k;
                this.updateUUID();
            }
        }
        return this.internal_key;
    }
    set key(val) {
        this.internal_key = val;
    }

    get parsed_key() {
        return this.key.replace(/\//g, "#;slash;#");
    }
    get path(): string {
        if(!this.parent) return "global";
        return this.parent.path + "/" + this.parsed_key;
    }
    
    get next_sibling() {
        if(this.parent == undefined) return;
        return this.parent.children[this.parent.find(this) + 1];
    }
    get prev_sibling() {
        if(this.parent == undefined) return;
        return this.parent.children[this.parent.find(this) - 1];
    }
    get depth() {
        let deepest = 0;
        this.children.forEach(c => {
            let potential = c.depth + 1;
            if(deepest < potential) deepest = potential;
        });
        return deepest;
    }
    get child_contains_error() {
        for(let child of this.children) {
            if(child.error !== undefined && !child.error.is_warning) return true;
            else if(child.child_contains_error) return true;
        }
        return false;
    }

    updateUUID() {
        this.uuid = uuidv4();
    }
    forEach(cb: (n?: JSONTree) => any) {
        if(typeof cb !== "function") return;

        for(let c of this) {
            cb(c);
        }
    }


    get(inp: string | string[]): JSONTree {
        if(Array.isArray(inp) || typeof inp == "string") {
            let key;
            let i_arr = inp;
            if(typeof inp === "string") {
               i_arr = inp.split("/");

               if(i_arr[0] === "global") i_arr.shift();
               if(i_arr.length === 0) return this; 
            }
            // @ts-ignore
            key = i_arr.shift(); 
            if(i_arr.length === 0 && this.data.replace(/\//g, "#;slash;#") === key) return this;
            
            if(key === "#;bridge_node_skip;#" && this.children.length > 0) {
                return this.children.find(c => c.children.length > 0).get(i_arr);
            }
                

            for(let c of this.children) {
                if(c.key.replace(/\//g, "#;slash;#") === key) {
                    if(i_arr.length === 0) {
                        return c;
                    } else {
                        return c.get(i_arr);
                    }
                }
            }
        } else {
            throw new TypeError("Expected string or string[], found " + typeof inp);
        }
    }
    isDataPath(path: string | string[]): boolean {
        let key;
        let i_arr = path;
        if(typeof path === "string") {
           i_arr = path.split("/");

           if(i_arr[0] === "global") i_arr.shift();
           if(i_arr.length == 0) return false; 
        }
        //@ts-ignore
        key = i_arr.shift();
        if(i_arr.length == 0 && this.data.replace(/\//g, "#;slash;#") == key) return true;
        
        
        for(let c of this.children) {
            if(c.key.replace(/\//g, "#;slash;#") == key) {
                if(i_arr.length == 0) {
                    return false;
                } else {
                    return c.isDataPath(i_arr);
                }
            }
        }
        return false;
    }
    find(child: JSONTree) {
        let i = 0;
        for(let c of this.children) {
            if(c === child) {
                return i;
            }

            i++;
        }
        return -1;
    }
    hasChild(key: string) {
        for(let c of this.children) {
            if(c.key === key)
                return true;
        }
        return false;
    }

    /**
     * Adds a new child to calling node
     * @param {JSONTree} child 
     */
    add(child: JSONTree, update_history=false) {        
        if(!this.is_array) {
            for(let c of this.children) {
                if(c.parsed_key == child.parsed_key) return c;
            }
            if(!Number.isNaN(Number(child.key)) && this.children.length === 0) this.type = "array";
        } else if(!Number.isNaN(Number(child.key)) || this.find(child) !== -1) {
            child.key = this.children.length + "";
        }

        child.parent = this;
        this.children.push(child);
        this.updateUUID();
        
        //PLUGIN HOOK
        PluginEnv.trigger("bridge:addedNode", {
            node: child
        });
        //HISTORY
        if(update_history) TabSystem.getHistory().add(new JSONAction("remove", this, child));
        return child;
    }
    /**
     * @param {String} new_data 
     */
    edit(new_data: string) {
        if(!new_data) throw new Error("Data may not be undefined or null.");
        if(this.type === "object" || this.type === "array") this.type = "string";
        this.data = new_data;
        this.updateUUID();
    }
    /**
     * @param {String} key (Optional)
     */
    remove(key?: string, update_history=false) {
        if(this.key === "global") return;
        this.parent.updateUUID();

        let c = key !== undefined ? this.children : this.parent.children;
        for(let i = 0; i < c.length; i++) {
            if(c[i].parsed_key == (key || this.parsed_key)) {
                //HISTORY
                if(!update_history) return c.splice(i, 1);
                TabSystem.getHistory().add(new JSONAction(
                    "add", 
                    key ? this : this.parent, 
                    c.splice(i, 1)[0]
                ));
                return;
            }
        }
    }
    /**
     * @param {JSONTree} node 
     * @param {Boolean} update_history 
     */
    removeNode(node: JSONTree, update_history=false) {
        this.updateUUID();
        
        for(let i = 0; i < this.children.length; i++) {
            if(node.parsed_key == this.children[i].parsed_key) {
                //HISTORY
                if(!update_history) return this.children.splice(i, 1);
                TabSystem.getHistory().add(new JSONAction(
                    "add", 
                    this, 
                    this.children.splice(i, 1)[0]
                ));
                return;
            }
        }
    }
    clone() {
        let clone = new JSONTree(this.key, this.data, this.parent, this.children, this.open);
        clone.type = this.type;
        return clone;
    }
    deepClone() {
        let clone: JSONTree = new JSONTree(this.key, this.data, this.parent, this.children.map(c => c.deepClone()), this.open);
        clone.type = this.type;
        return clone;
    }

    propose(path=this.path) {
        //console.log(PROVIDER.get(path), path)
        if(Store.state.Settings.bridge_predictions) {
            let { META, ...propose } = PROVIDER.get(path, this);
            this.addMeta(META);

            this.propose_cache = null;
            this.propose_cache_uses = 0;
            return propose;
        } else {
            if(this.propose_cache_uses === 0) {
                let { META, ...propose } = PROVIDER.get(path, this);
                this.addMeta(META);

                this.propose_cache = propose;
                this.propose_cache_uses++;
            } else {
                this.propose_cache_uses = 0;
            } 
            return this.propose_cache;
        }
    }
    addMeta(META: { [x: string]: any }={}) {
        this.meta = Object.assign(this.meta, META);

        const { is_color } = META;
        if(is_color && this.data === "") this.edit("#1778D2");
    }
    openNode(val=true) {
        this.updateUUID();

        this.open = val;
        return this;
    }
    toggleOpen() {
        this.updateUUID();

        this.open = !this.open;
        return this;
    }
    toggleOpenDeep(val=this.open) {
        this.updateUUID();

        this.open = !val;
        this.children.forEach(c => c.toggleOpenDeep(val));
        return this;
    }
    

    //NAVIGATING & MOVING
    moveUp() {
        if(this.parent == undefined) return false;
        this.parent.updateUUID();

        let a = this.parent.children;
        let me = this.parent.find(this);
        if(me == 0 || a.length < 1) return false;

        let tmp = a[me];
        a[me] = a[me - 1];
        a[me - 1] = tmp;
        return true;
    }
    moveDown() {
        if(this.parent == undefined) return false;
        this.parent.updateUUID();

        let a = this.parent.children;
        let me = this.parent.find(this);
        if(me == a.length - 1) return false;

        let tmp = a[me];
        a[me] = a[me + 1];
        a[me + 1] = tmp;
        return true;
    }
    next(skip=false): JSONTree {
        let next_sibling = this.next_sibling;

        if(!skip && this.open && this.children.length > 0) {
            return this.children[0];
        } else if(next_sibling != undefined) {
            return next_sibling;
        } else if(this.key != "global") {
            return this.parent.next(true);
        }
        return this;
    }
    previous() {
        let prev_sibling = this.prev_sibling;

        if(prev_sibling == undefined && this.key != "global") {
            return this.parent;
        } else if(this.key == "global") {
            return this;
        } else if(prev_sibling.open && prev_sibling.children.length > 0) {
            return prev_sibling.children[prev_sibling.children.length - 1];
        } else {
            return prev_sibling;
        }
    }
    searchAll(key: string) {
        let res: JSONTree[] = [];
        this.children.forEach(c => {
            if(c.key === key) res.push(c);
            res = res.concat(c.searchAll(key));
        });
        return res;
    }
    searchOne(key: string) {
        for(let c of this.children) {
            if(c.key === key) return c;
            c.searchOne(key);
        }
    }

    //Removes all keys of an object from the calling node
    removeByObject(data: { [x: string]: any }) {
        Object.keys(data).forEach(key => {
            this.remove(key);
        });

        this.updateUUID();
    }

    //JSON -> TREE
    buildFromObject(data: any, first=true, update_history=false, open_nodes=false) {
        if(data instanceof JSONTree) return data;
        this.type = getType(data);

        if(first || open_nodes) this.open = true;
        
        if(typeof data == "object") {
            for(let key in data) {
                if(typeof data[key] != "function" && key != "__ob__")
                    this.add(new JSONTree(key, undefined, this), update_history).buildFromObject(data[key], false, update_history, open_nodes);
            }
        } else if(typeof data != "function") {
            this.data = data + "";
        }

        if(first) this.updateUUID();
        return this;
    }
    /**
    * Can be used by plugins to hook into how a node is saved to disk. 
    * Overwriting this method is more efficient than looping over all nodes inside the plugin itself
    */
    identity() {
        return this;
    }
    //Tree -> JSON
    toJSON(build_arrays=true) {
        return Json.Format.toJSON(this, build_arrays);
    }
    buildForCache(): any {
        return {
            open: this.open,
            comment: this.comment,
            data: this.data,
            key: this.key,
            type: this.type,
            meta: this.meta,
            children: this.children.map(c => c.buildForCache())
        };
    }
    static buildFromCache(c: any) {
        return new JSONTree(c.key, c.data, undefined, undefined, c.open).buildFromCache(c);
    }
    buildFromCache(c: any) {
        //Load attributes which cannot be set with constructor
        this.comment = c.comment;
        this.type = c.type || (c.data === "" ? "object" : typeof Json.toCorrectType(c.data));
        this.meta = c.meta || {};

        if(c.children)
            this.children = c.children.map((child: any) => new JSONTree(child.key, child.data, this, undefined, child.open).buildFromCache(child));
        return this;
    }

    //ITERATOR
    /**
     * Returns a new iterator which iterates over the JSONTree
     * @typedef TreeIterator
     * @property {Function} hasNext
     * @property {Function} next
     * 
     * @returns {TreeIterator}
     */
    iterator() {
        return new TreeIterator(this);
    }
    *[Symbol.iterator] () {
        let iterator = new TreeIterator(this);
        while(iterator.hasNext()) {
            yield iterator.next();
        }
    }
}