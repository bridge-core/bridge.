import { ipcMain } from "electron";
import { dialog } from "electron";
import fs from "fs";
import DirToJSON from "dir-to-json";

ipcMain.on("getProjects", (event, args) => {
    fs.readdir(args.path, (err, files) => {
        if(err) console.log(err);
        event.sender.send("readProjects", { files, ...args });
        if(args.event_name) event.sender.send(args.event_name, { files, ...args });
    });
});
  
ipcMain.on("getDir", (event, args) => {
    DirToJSON(args.path, (err, files) => {
        if(err) console.log(err);

        event.sender.send("readDir", { files, ...args });
        if(args.event_name) event.sender.send(args.event_name, { files, ...args });
    });
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