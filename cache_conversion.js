/**
 * A simple script to convert the cache format of bridge. versions prior to v0.13.0-pre10 to the new format
 * 1) Drag the file into the folder of the project you want to convert
 * 2) Replace "<PROJECT NAME>" inside this file with the folder name of your project
 * 3) Run: "npm i mkdirp"
 * 4) Run: "node cache_conversion"
 */
const fs = require("fs");
const mkdirp = require("mkdirp");

let data = JSON.parse(fs.readFileSync("./bridge/.editor-cache").toString());

for(let file_name in data) {
    let path = "./bridge/cache/BP/" + file_name.replace("<PROJECT NAME>", "");
    let folder_path = path.split("/");
    folder_path.pop();
    folder_path = folder_path.join("/");

    try {
        mkdirp.sync(folder_path);
        const { content, format_version } = data[file_name];
        fs.writeFile(path, JSON.stringify({
            cache_content: content,
            format_version
        }), (err) => {
            if(err) throw err;
        })
    } catch(e) {
        console.log(e);
    }
}
