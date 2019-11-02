/**
 * Define context menu upon right clicking on a file (FileDisplayer.vue)
 */
import ManageFileMasks from "../../windows/FileMasks";
import FileSystem from "../FileSystem";
import ConfirmWindow from '../commonWindows/Confirm';
import InputWindow from '../commonWindows/Input';
import trash from "trash";
import TabSystem from '../TabSystem';
import { promises as fs } from "fs";
import OmegaCache from '../editor/OmegaCache';
import LightningCache from '../editor/LightningCache';
import { JSONFileMasks } from '../editor/JSONFileMasks';
import path from "path";
import { FileExplorer } from "../FileExplorer";
import LightningCacheInspector from "../../windows/LightningCache";

export const FILE_CONTEXT_MENU = (file_path: string, file: FileExplorer) => [
    {
        title: "Delete",
        action: () => {
            new ConfirmWindow(
                async () => {
                    OmegaCache.clear(file_path);
                    LightningCache.clear(file_path);
                    JSONFileMasks.delete(file_path);

                    await trash(file_path);
                    file.remove();
                    TabSystem.closeByPath(file_path);
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
        title: "Rename",
        action: () => {
            new InputWindow({
                text: path.basename(file_path, path.extname(file_path)),
                label: "Name",
                header: "Name Input",
                expand_text: path.extname(file_path)
            }, async (new_name: string) => {
                let closed = TabSystem.closeByPath(file_path);

                let new_path = path.join(path.dirname(file_path), new_name);
                OmegaCache.rename(file_path, new_path);
                LightningCache.rename(file_path, new_path);
                JSONFileMasks.rename(file_path, new_path);

                await fs.rename(file_path, new_path);
                file.rename(new_name);
                if(closed) FileSystem.open(new_path);
            });
        }
    },
    {
        title: "Duplicate",
        action: () => {
            new InputWindow({
                text: path.basename(file_path, path.extname(file_path)),
                label: "Name",
                header: "Name Input",
                expand_text: path.extname(file_path)
            }, async (new_name: string) => {
                let closed = TabSystem.closeByPath(file_path);

                let new_path = path.join(path.dirname(file_path), new_name);
                OmegaCache.duplicate(file_path, new_path);
                LightningCache.duplicate(file_path, new_path);
                JSONFileMasks.duplicate(file_path, new_path);
                
                await fs.copyFile(file_path, new_path);
                file.parent.children.push(new FileExplorer(file.parent, path.join(file.parent.path, new_name), new_path));
                if(closed) FileSystem.open(new_path);
            });
        }
    },
    { type: "divider" },
    {
        title: "File Layers",
        action: () => {
            new ManageFileMasks(file_path);
        }
    },
    {
        title: "LC Inspector",
        action: () => {
            new LightningCacheInspector(file_path);
        }
    }
];