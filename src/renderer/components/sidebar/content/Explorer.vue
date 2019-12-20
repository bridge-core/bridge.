<template>
    <v-container v-if="!no_projects">
        <span 
            v-if="selected !== undefined && selected !== '/@NO-RP@/' && selected !== '/@NO-DEPENDENCY@/'"
        >
            <component :is="toolbar_component" :selected="selected" :base_path="base_path"/>
            <v-divider/>
        </span>

        <v-layout align-center>
            <span style="padding: 0 4px;"><v-avatar tile size="36px"><img :src="project_icon"></v-avatar></span>
            
            <v-select
                v-if="force_project_algorithm === undefined"
                style="margin: 4px 0; margin-right: 4px; border-radius: 0; width: calc(100% - 48px);"
                ref="project_select"
                :items="project_items" 
                :value="selected" 
                :label="display_label"
                background-color="expanded_sidebar" 
                solo 
                :loading="loading" 
                :disabled="items.length <= 1"
                @input="(choice) => selected = choice"
                hide-details
            />
            <v-subheader
                v-else
                style="width: calc(100% - 48px);"
            >{{ selected }}</v-subheader>
        </v-layout>

        <v-divider></v-divider>
        <file-displayer
            v-if="loaded_file_defs && selected !== undefined && selected !== '/@NO-RP@/' && selected !== '/@NO-DEPENDENCY@/'" 
            :files="directory"
            :project="selected"
            :base_path="base_path"
            :explorer_type="explorer_type"
            class="file-displayer"
        />
        <v-progress-linear v-else-if="!loaded_file_defs || selected === undefined" indeterminate/>
        <div
            v-else-if="selected === '/@NO-DEPENDENCY@/'"
            style="padding: 4px;"
        >
            <p style="word-break: break-word;">It doesn't look like your current behavior pack has a corresponding resource pack registered inside its manifest file.</p>

            <v-btn @click="createRP" style="margin-right: 4px;">Create</v-btn><v-btn color="primary" @click="linkRP">Link</v-btn>
        </div>
        <div 
            v-else
            style="padding: 4px; word-break: break-word;"
        >
            <p style="word-break: break-word;">The resource pack which belongs to this behavior pack does not exist.</p>
            <v-btn color="primary" @click="unlinkRP" style="margin-right: 4px;"><v-icon>mdi-lock-open</v-icon>Unlink</v-btn>
        </div>

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
    import { BASE_PATH, BP_BASE_PATH } from '../../../scripts/constants';
    import DataUrl from "dataurl";
    import fsync, { promises as fs } from "fs";
    import LinkRPWindow from "../../../windows/LinkRPWindow";
    import CreateProjectWindow from '../../../windows/CreateProject';
    import PackLinker from '../../../scripts/utilities/LinkPacks';
    import OmegaCache from '../../../scripts/editor/OmegaCache';
    import ExplorerNoProjects from "./explorer/NoProjects";
    import PluginLoader from "../../../scripts/plugins/PluginLoader";
    import LightningCache from '../../../scripts/editor/LightningCache';
    import { JSONFileMasks } from "../../../scripts/editor/JSONFileMasks";
    import LoadingWindow from '../../../windows/LoadingWindow';
    import FileType from '../../../scripts/editor/FileType';
    import { setRP } from '../../../scripts/utilities/FindRP';
    import path from "path";

    export default {
        name: "content-explorer",
        components: {
            FileDisplayer,
            ExplorerToolbar,
            ExplorerRpToolbar,
            ExplorerNoProjects
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
                no_projects: false,
                loaded_file_defs: FileType.LIB_LOADED
            };
        },
        mounted() {
            this.$root.$on("refreshExplorer", () => EventBus.trigger("bridge:refreshExplorer"));
            EventBus.on("bridge:refreshExplorer", this.refresh);
            EventBus.on("bridge:selectProject", this.selectProject);
            EventBus.on("bridge:loadedFileDefs", this.onFileDefsLoaded);
            EventBus.on("bridge:findDefaultPack", this.findDefaultProject);
            window.addEventListener("resize", this.onResize);


            this.findDefaultProject();
        },
        destroyed() {
            this.$root.$off("refreshExplorer");
            EventBus.off("bridge:refreshExplorer", this.refresh);
            EventBus.off("bridge:selectProject", this.selectProject);
            EventBus.off("bridge:loadedFileDefs", this.onFileDefsLoaded);
            EventBus.off("bridge:findDefaultPack", this.findDefaultProject);
            window.removeEventListener("resize", this.onResize);
        },
        computed: {
            selected: {
                get() {
                    return this.$store.state.Explorer.project[this.explorer_type];
                },
                set(project) {
                    this.$store.commit("setExplorerProject", { store_key: this.explorer_type, project });
                    if(project !== undefined)
                        this.loadDirectory(project);
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
                return this.items;
            },
            project_icon() {
                try {
                    return DataUrl.convert({
                        data: fsync.readFileSync(this.base_path + this.selected + "/pack_icon.png"),
                        mimetype: `image/png`
                    });
                } catch(e) {
                    return DataUrl.convert({
                        data: fsync.readFileSync(__static + "/images/pack_icon.png"),
                        mimetype: `image/png`
                    });
                }
            }
        },
        methods: {
            async refresh(force_val) {
                if(this.force_project_algorithm) {
                    if(force_val) this.selected = force_val;
                    console.log("[REFRESH RP] " + this.selected);
                    this.loadDirectory(this.selected, true);
                } else {
                    try {
                        this.items = await this.getCurrentPacks();
                    } catch(e) { this.items = []; }
                    
                    this.no_projects = false;
                    console.log("[REFRESH BP] " + this.selected);

                    if(this.items.length === 0) {
                        this.no_projects = true;
                    }
                    this.loadDirectory(this.selected, true);
                }
            },

            selectProject(val) {
                this.loadDirectory(val, true);
            },
            onFileDefsLoaded() {
                this.loaded_file_defs = true;
            },
            
            async loadDirectory(dir=this.selected, force_reload) {
                let lw = new LoadingWindow().show();
                if(this.explorer_type === "explorer") {
                    EventBus.trigger("bridge:changedProject");
                    OmegaCache.init(dir);
                    LightningCache.init();
                    JSONFileMasks.resetMasks();
                }
                
                if(dir === undefined || dir === "/@NO-RP@/" || dir === "/@NO-DEPENDENCY@/") return lw.close();
                if(dir !== this.selected) {
                    this.selected = dir;
                    TabSystem.select(0);
                    return lw.close();
                }
                if(this.explorer_type === "explorer") EventBus.trigger("bridge:changedProject");
                if(this.explorer_type === "explorer") OmegaCache.init(dir);
                
                if(this.load_plugins) {
                    await PluginLoader.loadPlugins(dir);
                }
                lw.close();
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

            async findDefaultProject(force_refresh=false) {
                if(this.force_project_algorithm) {
                    this.selected = undefined;
                    if(force_refresh) setRP(undefined);
                    this.selected = await this.force_project_algorithm();
                } else {
                    try {
                        this.items = await this.getCurrentPacks();
                    } catch(e) { this.items = []; }
                    this.no_projects = false;
                    if(force_refresh) this.selected = undefined;

                    /**
                    * items[0] === "undefined":
                    *   Allows the no_projects screen to launch for users which didn't have a BP before the no_projects screen update
                    */
                    if(this.items.length === 0 || this.items[0] === "undefined") {
                        this.no_projects = true;
                    } else if(this.selected === "" || this.selected === undefined) {
                        this.loadDirectory(this.findDefaultBPProject());
                    }
                }
            },
            findDefaultBPProject() {
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
            unlinkRP() {
                PackLinker.unlink(this.$store.state.Explorer.project.explorer);
            },
            createRP() {
                new CreateProjectWindow(false, (rp_name) => {
                    PackLinker.link(this.$store.state.Explorer.project.explorer, rp_name);
                });
            },

            async getCurrentPacks() {
                let potential = await fs.readdir(BP_BASE_PATH, { withFileTypes: true });
                return potential.filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);
            }
        }
    }
</script>

<style scoped>
    div.container {
        padding: 0;
    }
</style>
