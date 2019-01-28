import fs from "fs";

export default class Provider {
    constructor(start_state) {
        console.log(__static);
        this.loadAsset("files")
            .then(files => files.forEach(
                f => this.loadAsset(f)
                    .then(data => this[f] = data)
            ));
    }

    loadAsset(name) {
        return new Promise((resolve, reject) => {
            fs.readFile(__static + `/auto_completions/${name}.json`, (err, data) => {
                if(err) reject(err);
                resolve(JSON.parse(data.toString()));
            });
        });
    }

    get(path) {
        console.log(path);
        return this.entity["entity"].propose.map(e => e.is);
    }
}