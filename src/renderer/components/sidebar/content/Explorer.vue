<template>
    <v-container v-if="!no_projects">
        <span 
            v-if="selected !== undefined && selected !== '/@NO-RP@/' && selected !== '/@NO-DEPENDENCY@/'"
        >
            <component :is="toolbar_component" :selected="selected" :base_path="base_path"/>
        </span>

        <v-layout align-center>
            <span style="padding: 0 4px;"><v-avatar size="36px"><img :src="project_icon"></v-avatar></span>
            
            <v-select
                v-if="force_project_algorithm === undefined"
                style="margin-bottom: 4px;"
                ref="project_select"
                :items="project_items" 
                :value="selected" 
                :label="display_label" 
                solo 
                dense 
                :loading="loading" 
                :disabled="items.length <= 1"
                @input="(choice) => selected = choice"
                hide-details
            />
            <v-subheader
                v-else
            >{{ selected }}</v-subheader>
        </v-layout>

        <v-divider></v-divider>
        <file-displayer
            v-if="selected !== undefined && selected !== '/@NO-RP@/' && selected !== '/@NO-DEPENDENCY@/'" 
            :files="directory"
            :project="selected"
            :base_path="base_path"
            :explorer_type="explorer_type"
            class="file-displayer"
        />
        <v-progress-linear v-else-if="selected === undefined" indeterminate/>
        <div
            v-else-if="selected === '/@NO-DEPENDENCY@/'"
            style="padding: 4px;"
            
        >
            <p style="word-break: break-word;">It doesn't look like your current behavior pack has a corresponding resource pack registered inside its manifest file.</p>

            <v-btn color="success" @click="createRP">Create</v-btn><v-btn color="primary" @click="linkRP">Link</v-btn>
        </div>
        <p
            v-else
            style="padding: 4px; word-break: break-word;"
        >
            The resource pack which belongs to this behavior pack does not exist.
        </p>
        <v-divider></v-divider>
    </v-container>
    <explorer-no-projects v-else/>
</template>

<script>
    import { ipcRenderer } from "electron";
    import FileDisplayer from "./explorer/FileDisplayer.vue";
    import ExplorerToolbar from "./explorer/Toolbar.vue";
    import ExplorerRpToolbar from "./explorer/RpToolbar.vue";
    import EventBus from "../../../scripts/EventBus";
    import TabSystem from "../../../scripts/TabSystem";
    import { BASE_PATH } from '../../../scripts/constants';
    import DataUrl from "dataurl";
    import fs from "fs";
    import LinkRPWindow from "../../../windows/LinkRPWindow";
    import CreateProjectWindow from '../../../windows/CreateProject';
    import PackLinker from '../../../scripts/utilities/LinkPacks';
    import OmegaCache from '../../../scripts/editor/OmegaCache';
    import ExplorerNoProjects from "./explorer/NoProjects";
    import PluginLoader from "../../../scripts/plugins/PluginLoader";
    import LightningCache from '../../../scripts/editor/LightningCache';

    export default {
        name: "content-explorer",
        components: {
            FileDisplayer,
            ExplorerToolbar,
            ExplorerRpToolbar,
            ExplorerNoProjects
        },
        provide: {
            base_path: this.base_path,
            selected: this.selected
        },
        props: {
            load_plugins: Boolean,
            base_path: String,
            explorer_type: String,
            force_project_algorithm: Function,
            toolbar_component: {
                default: "explorer-toolbar",
                type: String,
                validator(value) {
                    return ["explorer-toolbar", "explorer-rp-toolbar"].indexOf(value) !== -1;
                }
            }
        },
        data() {
            return {
                listeners: ["readDir", "readProjects"],
                items: [],
                display_label: "Loading...",
                project_select_size: window.innerWidth / 7.5,
                no_projects: false
            };
        },
        async mounted() {
            this.$root.$on("refreshExplorer", () => {
                this.refresh();
            });
            EventBus.on("bridge:refreshExplorer", this.refresh);

            ipcRenderer.on("readProjects", (event, args) => {
                this.items = args.files;
                this.no_projects = false;
                
                if(this.items.length === 0 || this.items[0] === "undefined") {
                    this.no_projects = true;
                } else if(this.selected === "" || this.selected === undefined) {
                    this.getDirectory(this.findDefaultProject());
                }
            });

            if(this.force_project_algorithm) {
                this.selected = undefined;
                this.selected = await this.force_project_algorithm();
            } else {
                this.getProjects({ event_name: "initialProjectLoad", func () {} });
            }

            window.addEventListener("resize", this.onResize);
        },
        destroyed() {
            this.listeners.forEach(e => {
                ipcRenderer.removeAllListeners(e);
            });
            this.$root.$off("refreshExplorer");
            EventBus.off("bridge:refreshExplorer", this.refresh);

            window.removeEventListener("resize", this.onResize);
        },
        computed: {
            selected: {
                get() {
                    return this.$store.state.Explorer.project[this.explorer_type];
                },
                set(project) {
                    this.$store.commit("setExplorerProject", { store_key: this.explorer_type, project });
                    this.getDirectory(project);
                    EventBus.trigger("updateTabUI");
                    // EventBus.on("updateSelectedTab");
                }
            },
            loading() {
                return this.items.length == 0;
            },
            directory() {
                return this.$store.state.Explorer.files[this.explorer_type] ? this.$store.state.Explorer.files[this.explorer_type].child : [];
            },

            project_items() {
                let size = Math.floor(this.project_select_size / 10.5);
                
                let tmp = [];
                this.items.forEach(e => tmp.push({ 
                    text: e.length > size && !e.includes(" ") ? e.substr(0, size) + "\u2026" : e, 
                    value: e 
                }));
                return tmp;
            },
            project_icon() {
                try {
                    return DataUrl.convert({
                        data: fs.readFileSync(this.base_path + this.selected + "/pack_icon.png"),
                        mimetype: `image/png`
                    });
                } catch(e) {
                    return DataUrl.convert({
                        data: fs.readFileSync(__static + "/images/pack_icon.png"),
                        mimetype: `image/png`
                    });
                }
            }
        },
        methods: {
            refresh(force_val) {
                if(this.force_project_algorithm) {
                    if(force_val) this.selected = force_val;
                    console.log("[REFRESH RP] " + this.selected);
                    this.getDirectory(this.selected, true);
                } else {
                    this.getProjects({
                        event_name: "refreshExplorer",
                        func: () => {
                            console.log("[REFRESH] " + this.selected);
                            this.getDirectory(undefined, true);
                        }
                    });
                }
            },
            

            getProjects({ event_name, func }={}) {
                this.registerListener(event_name, func);

                ipcRenderer.send("getProjects", {
                    path: this.base_path,
                    event_name
                });
            },
            getDirectory(dir=this.selected, force_reload) {
                if(this.explorer_type === "explorer") {
                    EventBus.trigger("bridge:changedProject");
                    OmegaCache.init(dir);
                    LightningCache.init();
                }
                
                if(dir === undefined || dir === "/@NO-RP@/" || dir === "/@NO-DEPENDENCY@/") return;
                if(dir !== this.selected) {
                    this.selected = dir;
                    TabSystem.select(0);
                    return;
                }
                if(this.explorer_type === "explorer") EventBus.trigger("bridge:changedProject");
                if(this.explorer_type === "explorer") OmegaCache.init(dir);
                
                this.$store.commit("loadExplorerDirectory", {
                    store_key: this.explorer_type,
                    path: this.base_path + this.selected,
                    force_reload
                });
                if(this.load_plugins) {
                    PluginLoader.loadPlugins(dir);
                } 
            },

            registerListener(event_name, func) {
                if(event_name && !this.listeners.includes(event_name)) {
                    ipcRenderer.on(event_name, func);
                    this.listeners.push(event_name);
                }
            },
            onResize() {
                this.project_select_size = window.innerWidth / 7.5;
            },

            findDefaultProject() {
                if(this.$store.state.Settings.default_project === undefined) return this.items[0];
                
                for(let i = 0; i < this.items.length; i++) {
                    if(this.items[i].toLowerCase() === this.$store.state.Settings.default_project.toLowerCase())
                        return this.items[i];
                }
                return this.items[0];
            },

            linkRP() {
                new LinkRPWindow(this.$store.state.Explorer.project.explorer);
            },
            createRP() {
                new CreateProjectWindow(false, (rp_name) => {
                    PackLinker.link(this.$store.state.Explorer.project.explorer, rp_name);
                });
            }
        }
    }
</script>

<style scoped>
    div.container {
        padding: 0;
    }
</style>
