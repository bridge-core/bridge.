import fs from "fs";
let DATA = [];

function readData(key) {
    return new Promise((resolve, reject) => {
        fs.readFile(`${__static}\\template_sets\\${key}.json`, (err, data) => {
            if(err) reject(err);
            else resolve(JSON.parse(data.toString()));
        });
    })
}

export async function loadTemplateSets() {
    console.log("[LOAD] TEMPLATE SETS");
    let files = await readData("files");
    let proms = files.map(f => readData(f).then(data => DATA.push(data)));
    await Promise.all(proms);
    DATA = DATA.sort((a, b) => a.title.localeCompare(b.title));
    return DATA;
}

export function getTemplateSets() {
    return DATA;
}