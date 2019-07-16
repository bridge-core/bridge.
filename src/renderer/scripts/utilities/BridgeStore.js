import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";

export default class BridgeStore {
    constructor(path, namespace) {
        this.namespace = namespace + path.sep;
        this.path = path;
    }

    setup(namespace) {
        if(namespace === undefined) throw new Error("You need to define a namespace");
        this.namespace = namespace + path.sep;
        mkdirp.sync(path.join(this.path, this.namespace));
    }
    load(name) {
        if(this.namespace === undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
        return JSON.parse(fs.readFileSync(path.join(this.path, this.namespace, name)));
    }
    save(name, data) {
        if(this.namespace === undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");

        let tmp = {};
        try {
            tmp = JSON.stringify(data);
        } catch(e) {
            throw new Error("Provided data is not a valid store content.");
        }
        return fs.writeFileSync(path.join(this.path, this.namespace, name), tmp);
    }
    exists(name) {
        if(this.namespace === undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
        
        return fs.existsSync(path.join(this.path, this.namespace, name));
    }
}