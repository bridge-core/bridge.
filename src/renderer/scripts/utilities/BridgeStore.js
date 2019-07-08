import fs from "fs";
import mkdirp from "mkdirp";
import { sep } from "path";

export default class BridgeStore {
    constructor(path, namespace) {
        this.namespace = namespace + sep;
        this.path = path;
    }

    setup(namespace) {
        if(namespace === undefined) throw new Error("You need to define a namespace");
        this.namespace = namespace + sep;
        mkdirp.sync(this.path + this.namespace);
    }
    load(name) {
        if(this.namespace === undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
        return JSON.parse(fs.readFileSync(this.path + this.namespace + name));
    }
    save(name, data) {
        if(this.namespace === undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");

        let tmp = {};
        try {
            tmp = JSON.stringify(data);
        } catch(e) {
            throw new Error("Provided data is not a valid store content.");
        }
        return fs.writeFileSync(this.path + this.namespace + name, tmp);
    }
    exists(name) {
        if(this.namespace === undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
        console.log(this.path + this.namespace + name);
        
        return fs.existsSync(this.path + this.namespace + name);
    }
}
