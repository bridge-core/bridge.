<template>
    <v-list three-line>
        <v-layout v-if="plugins == undefined" justify-center>
            <v-progress-circular
                :size="70"
                :width="5"
                color="primary"
                indeterminate
            ></v-progress-circular>
        </v-layout>

        <div v-else-if="show_list">
            <template v-for="(plugin, i) in plugins_to_show">
                <v-list-tile :key="`plugin-window-element-${Math.random()}-${i}`">
                    <v-list-tile-content>
                        <v-list-tile-title>{{ plugin.name }}</v-list-tile-title>
                        <v-list-tile-sub-title class="font-weight-light">by {{ plugin.author }}</v-list-tile-sub-title>
                    </v-list-tile-content>

                    <v-list-tile-action>
                        <v-list-tile-action-text>{{ plugin.version }}</v-list-tile-action-text>

                        <v-btn v-if="show_uninstall" @click.stop.native="uninstall(plugin.id)" color="error" slot="activator" small>
                            Uninstall
                        </v-btn>
                        <v-btn v-else @click.stop.native="install(plugin.id)" color="success" slot="activator" small>
                            Install
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>

                <span class="plugin-desc text--secondary font-weight-light" :key="`plugin-popup-desc-${Math.random()}-${i}`">{{ plugin.description }}</span>

                <v-divider v-if="i < plugins_to_show.length - 1" :key="`plugin-popup-divider-${Math.random()}-${i}`"></v-divider>
            </template>
        </div>
        
        <v-layout justify-center v-else>
            <h3>
                {{ no_plugins_message }}
            </h3>
        </v-layout>
        <v-snackbar
            v-model="notification"
            :color="notification_type"
            :multi-line="true"
            :timeout="3000"
            top
        >
            <span v-if="notification_type == 'success'">Successfully installed plugin</span>
            <span v-else>Successfully uninstalled plugin</span>
        </v-snackbar>
    </v-list>
</template>

<script>
import fs from "fs";
import PluginEnv from "../../scripts/plugins/PluginEnv";

export default {
    name: "plugin-list",
    props: {
        plugins: Array,
        is_fullscreen: Boolean,
        filter: String
    },
    created() {
        this.loadPlugins();
    },
    data() {
        return {
            plugins_to_show: [],
            notification: false,
            notification_type: "success"
        }
    },
    computed: {
        show_uninstall: {
            get() {
                return this.filter == 'active';
            },
            set() {

            }
        },
        no_plugins_message() {
            if(this.filter == "active") return "There are currently no activated plugins inside this project. Plugins can speed up your work by providing new features to bridge.";
            if(this.filter == "available") return "There are currently no deactivated plugins inside this project. Plugins can speed up your work by providing new features to bridge.";
        },
        show_list() {
            return this.plugins_to_show.length > 0;
        }
    },
    methods: {
        loadPlugins() {
            let uninstalled = this.uninstalled_plugins();
            
            if(this.show_uninstall) {
                this.plugins_to_show = this.plugins.filter(plugin => plugin != 'unknown' && plugin != 'module' && !uninstalled.includes(plugin.id));
            } else {
                this.plugins_to_show = this.plugins.filter(plugin => plugin != 'unknown' && plugin != 'module' && uninstalled.includes(plugin.id));
            }
        },
        uninstalled_plugins() {
            let path = PluginEnv.Runtime.getBridgePath() + "uninstalled_plugins.json";
            if(fs.existsSync(path)) return JSON.parse(fs.readFileSync(path));
            return [];
        },

        uninstall(id) {
            let path = PluginEnv.Runtime.getBridgePath() + "uninstalled_plugins.json";
            fs.readFile(path, (err, data) => {
                if(err) console.error(err);
                let content = JSON.parse(data.toString());
                if(!content.includes(id)) content.push(id);
                
                fs.writeFile(path, JSON.stringify(content), (err) => {
                    if(err) console.error(err);
                    this.loadPlugins();

                    this.notification = true;
                    this.notification_type = "error";
                    this.refresh();
                });
            });
            
        },
        install(id) {
            let path = PluginEnv.Runtime.getBridgePath() + "uninstalled_plugins.json";
            fs.readFile(path, (err, data) => {
                if(err) console.error(err);
                let content = JSON.parse(data.toString());
                content.splice(content.indexOf(id), 1);
                
                fs.writeFile(path, JSON.stringify(content), (err) => {
                    if(err) console.error(err);
                    this.loadPlugins();

                    this.notification = true;
                    this.notification_type = "success";
                    this.refresh();
                });
            });
           
        },
        refresh() {  
            this.$store.commit("refreshAllPlugins");
        }
    },
    watch: {
        filter() {
            console.log("Update");
            
            this.loadPlugins();
        }
    }
}
</script>

<style scoped>
    .plugin-desc {
        margin: 0 16px 16px 16px;
    }
</style>
