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
import { readJSON } from "../utilities/JsonFS";
import Manifest from "../files/Manifest";
import { writeJSON } from "fs-extra";

export const FILE_CONTEXT_MENU = async (file_path: string, file: FileExplorer) => {
    const file_name = path.basename(file_path);
    const DEFAULT_MENU = [
        {
            title: "Open to the Side",
            action: () => {
                TabSystem.split_screen_active = true;
                FileSystem.open(file_path)
            }
        },
        { type: "divider" },
        {
            title: "Delete",
            action: () => {
                new ConfirmWindow(
                    async () => {
                        await trash(file_path);
                        file.remove();
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


    /**
     * QUICK ACTION TO TOGGLE CLIENT SCRIPTS
     */
    if(file_name === "manifest.json") {
        let manifest: Manifest = await readJSON(file_path).catch(console.error);
        if(Manifest.hasClientData(manifest)) {
            DEFAULT_MENU.push({
                title: "Remove Client Scripts",
                action: () => {
                    Manifest.removeClientData(manifest);
                    writeJSON(file_path, manifest);
                }
            });
        } else {
            DEFAULT_MENU.push({
                title: "Add Client Scripts",
                action: () => {
                    Manifest.addClientData(manifest);
                    writeJSON(file_path, manifest);
                }
            });
        }
    }

    return DEFAULT_MENU;
};