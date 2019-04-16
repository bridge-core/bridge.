import { ipcMain } from "electron";
import { dialog } from "electron";
import fs from "fs";
import path from "path";
import DirToJSON from "dir-to-json";
import getGameDirectory from "../shared/getGameDirectory";

const base_path = path.join(getGameDirectory(), "/games/com.mojang");
const behavior_path = path.join(base_path, "/development_behavior_packs");

// ipcMain.on("getOpenedWithData", event => {
//     let data = null;
//     if(process.platform === "win32" && process.env.NODE_ENV !== "development" && process.argv.length >= 2) {
//       let to_open = process.argv[1];
//       data = to_open;
//     }
//     event.returnValue = data
// });

ipcMain.on("getProjects", (event, args) => {
    fs.readdir(behavior_path, (err, files) => {
        if(err) console.log(err);
        event.sender.send("readProjects", { files, ...args });
        if(args.event_name) event.sender.send(args.event_name, { files, ...args });
    });
});
  
ipcMain.on("getDir", (event, args) => {
    DirToJSON(path.join(behavior_path, args.path), (err, files) => {
        if(err) console.log(err);

        event.sender.send("readDir", { files, ...args });
        if(args.event_name) event.sender.send(args.event_name, { files, ...args });
    });
});
  
ipcMain.on("getFile", (event, args) => {
    fs.readFile(path.join(behavior_path, args.path), (err, content) => {
        if(err) console.log(err);
        let file = args.path.split("/").pop();
  
        event.sender.send("readFile", { content, file, ...args });
    });
});

ipcMain.on("saveFile", (event, { path, content }) => {
    fs.writeFile(path.join(behavior_path, path), content, (err) => console.warn(err));
});

ipcMain.on("openFileDialog", (event, args) => {
    dialog.showOpenDialog({
        title: "Select a file",
        properties: ["'openFile", "multiSelections" ]
    }, (file_paths) => {
        if(file_paths) file_paths.forEach(path => event.sender.send("openFile", path));
    });
});

ipcMain.on("saveAsFileDialog", (event, { path, content }) => {    
    dialog.showSaveDialog({ defaultPath: path.replace(/\//g, "\\") }, (file_path) => {
        if(file_path) {
            fs.writeFile(file_path, content, (err) => {
                if(err) throw err;
            });
        } 
    });
});