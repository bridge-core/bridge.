import { ipcMain } from "electron";
import { dialog } from "electron";
import fs from "fs";
import path from "path";
import DirToJSON from "dir-to-json";
const base_path = `C:/Users/${process.env.USERNAME}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/`;
const behavior_path = base_path + "development_behavior_packs/";

ipcMain.on("getProjects", (event, args) => {
    fs.readdir(base_path + "development_behavior_packs", (err, files) => {
        if(err) console.log(err);
        event.sender.send("readProjects", { files, ...args });
        if(args.event_name) event.sender.send(args.event_name, { files, ...args });
    });
});
  
ipcMain.on("getDir", (event, args) => {
    DirToJSON(behavior_path + args.path, (err, files) => {
        if(err) console.log(err);

        event.sender.send("readDir", { files, ...args });
        if(args.event_name) event.sender.send(args.event_name, { files, ...args });
    });
});
  
ipcMain.on("getFile", (event, args) => {
    fs.readFile(behavior_path + args.path, (err, content) => {
        if(err) console.log(err);
        let file = args.path.split("/").pop();
  
        event.sender.send("readFile", { content, file, ...args });
    });
});

ipcMain.on("saveFile", (event, { path, content }) => {
    fs.writeFile(behavior_path + path, content, (err) => console.warn(err));
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