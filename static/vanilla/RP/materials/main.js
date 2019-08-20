const fs = require("fs");

let data = JSON.parse(fs.readFileSync("./entity.material").toString());
data = Object.keys(data.materials)
    .filter(e => e !== "version")
    .map(e => e.split(":")[0]);

fs.writeFile("./parsed-data.json", JSON.stringify(data), (err) => {
    if(err) throw err;
});