<template>
    <v-container>
        <v-toolbar flat height="30px">
            <v-tooltip right class="first">
                <v-btn icon flat @click.stop="refresh" slot="activator" small>
                    <v-icon small>refresh</v-icon>
                </v-btn>
                <span>Refresh</span>
            </v-tooltip>

            <v-tooltip right>
                <v-btn icon flat @click.stop="open_create_file_window" slot="activator" small>
                    <v-icon small>mdi-file-document</v-icon>
                </v-btn>
                <span>New file</span>
            </v-tooltip>

            <v-spacer></v-spacer>
            <v-tooltip right>
                <v-btn icon flat @click.stop="" slot="activator" small>
                    <v-icon small>more_vert</v-icon>
                </v-btn>
                <span>More...</span>
            </v-tooltip>
        </v-toolbar>
        <v-select
            ref="project_select"
            :items="project_items" 
            :value="selected" 
            :label="display_label" 
            solo 
            dense 
            :loading="loading" 
            :disabled="items.length <= 1"
            @input="getDirectory"
        ></v-select>
        <v-divider></v-divider>
        <file-displayer :files="clever_directory" :project="selected" class="file-displayer"></file-displayer>
        <v-divider></v-divider>
    </v-container>
</template>

<script>
    import { ipcRenderer } from "electron";
    import FileDisplayer from "./explorer/FileDisplayer.vue";
    import CreateFileWindow from "../../../windows/CreateFile";
    
    export default {
        name: "content-explorer",
        components: {
            FileDisplayer
        },
        created() {
            this.$root.$on("refreshExplorer", () => {
                this.refresh();
            });

            ipcRenderer.on("readDir", (event, args) => {
                this.directory = args.files;
                this.$store.commit("loadAllPlugins", { args, selected: this.selected, base_path: this.base_path });
            });

            ipcRenderer.on("readProjects", (event, args) => {
                this.items = args.files;

                if (this.items.length == 0) {
                    this.display_label = "No projects found";
                } else if(this.selected == "") {
                    this.$set(this, "selected", this.items[0]);
                }
            });

            this.getProjects({ event_name: "initialProjectLoad", func: () => {
                this.getDirectory();
            }});

            window.addEventListener("resize", this.on_resize);
        },
        destroyed() {
            this.listeners.forEach(e => {
                ipcRenderer.removeAllListeners(e);
            });
            this.$root.$off("refreshExplorer");

            window.removeEventListener("resize", this.on_resize);
        },
        data() {
            return {
                listeners: ["readDir", "readProjects"],
                items: [],
                directory: undefined,
                display_label: "Loading...",
                project_select_size: window.innerWidth / 7.5
            };
        },
        computed: {
            selected: {
                get() {
                    return this.$store.state.Explorer.project;
                },
                set(project) {
                    this.$store.commit("setExplorerProject", project);
                }
            },
            loading() {
                return this.items.length == 0;
            },
            clever_directory() {
                return this.directory ? this.directory.children : [];
            },

            project_filter_color() {
                return this.$store.state.TabSystem.project_filter ? "green" : "";
            },
            base_path() {
                return this.$store.state.TabSystem.base_path;
            },
            project_items() {
                let size = Math.floor(this.project_select_size / 8.25);
                
                let tmp = [];
                this.items.forEach(e => tmp.push({ 
                    text: e.length > size && !e.includes(" ") ? e.substr(0, size) + "\u2026" : e, 
                    value: e 
                }));
                return tmp;
            }
        },
        methods: {
            refresh() {
                this.getProjects({
                    event_name: "refreshExplorer",
                    func: () => {
                        this.$store.commit("forceReloadNextPluginRequest");
                        console.log(this.selected + " refreshed");
                        this.getDirectory();
                    }
                });
            },
            open_create_file_window() {
                new CreateFileWindow();
            },
            toggleProjectFilter() {
                this.$store.commit("toggleProjectFilter");
            },

            getProjects({ event_name, func }={}) {
                this.registerListener(event_name, func);

                ipcRenderer.send("getProjects", { 
                    event_name
                });
            },
            getDirectory(dir=this.selected, { event_name, func }={}) {
                if(dir != this.selected) this.$set(this, "selected", dir);
                this.$store.commit("setSelectedTab", -1)
                this.registerListener(event_name, func);

                ipcRenderer.send("getDir", { 
                    path: dir, 
                    event_name
                });
            },

            registerListener(event_name, func) {
                if(event_name && !this.listeners.includes(event_name)) {
                    ipcRenderer.on(event_name, func);
                    this.listeners.push(event_name);
                }
            },
            on_resize() {
                console.log(this.project_select_size);
                
                this.project_select_size = window.innerWidth / 7.5;
            }
        }
    }
</script>

<style scoped>
    div.container {
        padding: 0;
    }

    button {
        padding: 0;
        width: 16px;
        height: 28px;
    }
    .v-btn {
        margin: 0;
    }
    .first {
        padding-left: 0.1em;
    }
</style>

<style>
    nav .v-toolbar__content {
        padding: 0;
    }
</style>