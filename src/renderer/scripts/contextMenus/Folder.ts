/**
 * Define context menu upon right clicking on a folder (FileDisplayer.vue)
 */
import ConfirmWindow from '../commonWindows/Confirm';
import InputWindow from '../commonWindows/Input';
import trash from "trash";
import { promises as fs } from "fs";
import path from "path";
import { FileExplorer } from "../FileExplorer";

export const FOLDER_CONTEXT_MENU = (file_path: string, file: FileExplorer) => [
    {
        title: "Delete",
        action: () => {
            new ConfirmWindow(
                async () => {
                    await trash(file_path);
                    await file.remove();
                }, 
                () => {}, 
                `Are you sure that you want to delete "${path.basename(file_path).replace(/\\/g, "/")}"?`,
                {
                    options: {
                        is_persistent: false
                    }
                }
            );
        }
    },
    {
        title: "New Folder",
        action: () => {
            new InputWindow({
                text: "",
                label: "Name",
                header: "Name Input"
            }, async (name) => {
                await fs.mkdir(path.join(file_path, name), { recursive: true });

                let curr_file = file;
                name.split(/\\|\//g).forEach(folder => {
                    let tmp = new FileExplorer(file, path.join(file.path, folder), path.join(file_path, folder), true, true);
                    curr_file.children.push(tmp);
                    curr_file = tmp;
                })
            });
        }
    }
];