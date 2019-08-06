<template>
    <p v-if="first && (!files || files.length == 0)">
        This directory has no content.
    </p>
    <div :style="element_style" :class="element_class" v-else>
        <details v-for="(file) in only_folders" :open="file.is_open" :key="file.absolutePath + file.is_open">
            <summary @click="openDir(file.path)" v-ripple>
                <v-icon class="open" small>mdi-folder-open</v-icon><v-icon class="closed" small>mdi-folder</v-icon>
                <span class="folder"> {{ file.name }}</span>
            </summary>
            <file-displayer
                v-if="file.is_open"
                :files="file.child"
                :first="false"
                :project="project"
                :base_path="base_path"
                :explorer_type="explorer_type"
            />
        </details>
        <div 
            v-for="(file) in only_files"
            :key="file.absolutePath"
            class="file"
            @click.stop="openFile(file.absolutePath)"
            @contextmenu="(event) => showContextMenu(event, file.absolutePath)"
            v-ripple
        >
            <v-icon small>{{ icon(getExtension(file.name)) }}</v-icon> {{ file.name }}
        </div>
    </div>
</template>

<script>
    import { ipcRenderer } from "electron";
    import FileSystem from "../../../../scripts/FileSystem";
    import LoadingWindow from "../../../../windows/LoadingWindow";
    import uuidv4 from "uuid/v4";
    import ConfirmWindow from '../../../../scripts/commonWindows/Confirm';
    import InputWindow from '../../../../scripts/commonWindows/Input';
    import trash from "trash";
    import TabSystem from '../../../../scripts/TabSystem';
    import fs from "fs";
    import Assert from '../../../../scripts/plugins/PluginAssert';
    import OmegaCache from '../../../../scripts/editor/OmegaCache';
    import LightningCache from '../../../../scripts/editor/LightningCache';

    export default {
        name: "file-displayer",
        props: {
            displayer_key: {
                default: uuidv4(),
                type: String
            },
            files: Array,
            project: String,
            first: {
                default: true,
                type: Boolean
            },
            base_path: String,
            explorer_type: String
        },
        data() {
            return {
                file_displayer_height: window.innerHeight - 199
            };
        },
        created() {
            if(this.first) window.addEventListener("resize", this.on_resize);
        },
        destroyed() {
            if(this.first) window.removeEventListener("resize", this.on_resize);
        },
        computed: {
            element_style() {
                return this.first ? `max-height: ${this.file_displayer_height}px;` : "";
            },
            element_class() {
                return this.first ? "file-displayer" : "";
            },

            loop_files() {
                return [...this.files].sort((a, b) => {
                    if(a.child && !b.child) return -1;
                    if(!a.child && b.child) return 1;
                    if(a.name > b.name) return 1;
                    if(a.name < b.name) return -1;
                    return 0;
                });
            },
            only_folders() {
                return this.loop_files.filter(f => f.isDir && f.name !== "cache");
            },
            only_files() {
                return this.loop_files.filter(f => !f.isDir);
            }
        },
        methods: {
            openFile(path) {
                if(!this.$store.state.LoadingWindow["open-file"]) {
                    new LoadingWindow("open-file").show();
                    FileSystem.open(path);
                } 
            },
            openDir(path) {
                this.$store.commit("setExplorerIsDirOpen", { store_key: this.explorer_type, path });
            },
            getExtension(name) {
                return name.split(".").pop().toLowerCase();
            },
            icon(ext) {
                return this.$store.state.Appearance.files[ext] ? this.$store.state.Appearance.files[ext] : "mdi-file-document-outline";
            },
            on_resize(e) {
                this.file_displayer_height = window.innerHeight - 199;
            },
            showContextMenu(event, file_path) {
                let file_ext = file_path.split(".").pop();
                let file_name = file_path.split(".");
                file_name.pop();
                file_name = file_name.join(".").split(/\\|\//g).pop();
                let excl_path = file_path.replace(`${file_name}.${file_ext}`, "");

                this.$store.commit("openContextMenu", {
                    x_position: event.clientX,
                    y_position: event.clientY,
                    menu: [
                        {
                            title: "Delete",
                            action: () => {
                                new ConfirmWindow(
                                    async () => {
                                        OmegaCache.clear(file_path);
                                        LightningCache.clear(file_path);

                                        await trash(file_path);
                                        this.$root.$emit("refreshExplorer");
                                        TabSystem.closeByPath(file_path);
                                    }, 
                                    () => {}, 
                                    `Are you sure that you want to delete "${file_path.replace(/\\/g, "/").replace(this.base_path, "")}"?`,
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
                                    text: file_name,
                                    label: "Name",
                                    header: "Name Input",
                                    expand_text: "." + file_ext
                                }, (new_name) => {
                                    let closed = TabSystem.closeByPath(file_path);

                                    let new_path = `${excl_path}${new_name}`;
                                    OmegaCache.rename(file_path, new_path);
                                    LightningCache.rename(file_path, new_path);
                                    fs.rename(file_path, new_path, (err) => {
                                        if(err) Assert.throw("bridge. Core", err);
                                        this.$root.$emit("refreshExplorer");
                                        if(closed) FileSystem.open(new_path);
                                    });
                                });
                            }
                        }
                    ]
                });
            }
        }
    }
</script>

<style scoped>
    div {
        padding-left: 0.5em;
    }
    div.file {
        cursor: pointer;
        overflow-x: auto;
        white-space: nowrap;
    }
    div.file::-webkit-scrollbar, span.folder::-webkit-scrollbar  {
        width: 2px;
        height: 2px;
    }
    span.folder {
        overflow-x: auto;
        white-space: nowrap;
    }

    summary {
        outline: none;
        cursor: pointer;
    }
    summary::-webkit-details-marker {
        display: none
    }
    details[open]  > summary > .open {
        display: inline;
    }
    details > summary > .open {
        display: none;
    }
    details[open]  > summary > .closed {
        display: none;
    }
    details > summary > .closed {
        display: inline;
    }

    .file-displayer {
        overflow-y: auto;
    }
</style>