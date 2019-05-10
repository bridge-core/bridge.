<template>
<div>
    <div v-if="meets_search && !plugin.is_dependency_only && (!installed || is_update)">
        <v-list-tile>
            <v-list-tile-content>
                <v-list-tile-title>{{ plugin.name }}</v-list-tile-title>
                <v-list-tile-sub-title class="text--primary">by {{ plugin.author }}</v-list-tile-sub-title>
                <v-list-tile-sub-title>{{ plugin.description }}</v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
                <v-list-tile-action-text>{{ plugin.version }}</v-list-tile-action-text>
                <v-tooltip :right="!is_fullscreen" :left="is_fullscreen" v-if="!is_update">
                    <v-btn slot="activator" @click.stop="download()" :disabled="!is_compatible" :loading="loading" icon>
                        <v-icon>cloud_download</v-icon>
                    </v-btn>
                    <span>Download</span>
                </v-tooltip>
                <v-btn slot="activator" @click.stop="download()" :disabled="!is_compatible" :loading="loading" flat round color="success" v-else>
                    Update
                </v-btn>
                
            </v-list-tile-action>
        </v-list-tile>
        <div style="padding: 0 16px; cursor: default;" v-if="!is_compatible && !is_update" class="error--text">You cannot install this plugin because it requires a higher version of bridge.</div>
        <div style="padding: 0 16px; cursor: default;" v-if="!is_compatible && is_update" class="error--text">You cannot install this update because it requires a higher version of bridge.</div>
        <v-divider/>
    </div>
</div>
    
</template>

<script>
import fs from "fs";
import mkdirp from "mkdirp";
import { APP_VERSION, BASE_PATH } from "../../scripts/constants";
import * as VersionUtils from "../../scripts/VersionUtils";

export default {
    name: "cloud-plugin",
    props: {
        plugins: Object,
        plugin_key: String,
        plugin: Object,
        search: String,
        last: Boolean,
        is_fullscreen: Boolean,
        installed_plugins: Array
    },
    data() {
        return {
            web_path: "https://solveddev.github.io/bridge-plugins/",
            loading: false,
            total_to_install: 1,
            total_installed: 0
        };
    },
    computed: {
        meets_search() {
            if(this.search == "") return true;
            return this.plugin.name.includes(this.search) 
                || this.plugin.description.includes(this.search) 
                || this.plugin.author.includes(this.search) 
                || this.plugin_key.includes(this.search);
        },
        installed() {
            if(this.installed_plugins.length == 0) return false;

            let i = 0;
            let current = this.installed_plugins[0];
            if(typeof current == "string") current = { id: "" };

            while(i < this.installed_plugins.length && current.id.split(/\\|\//g).pop() != this.plugin_key + ".js") {
                i++;
                current = this.installed_plugins[i];
                
                if(typeof current == "string") current = { id: "" };
            }
            return i != this.installed_plugins.length;
        },
        is_update() {
            if(this.installed_plugins.length == 0) return false;

            let i = 0;
            let current = this.installed_plugins[0];
            if(typeof current == "string") current = { id: "" };

            while(i < this.installed_plugins.length && current.id.split(/\\|\//g).pop() != this.plugin_key + ".js") {
                i++;
                current = this.installed_plugins[i];
                if(typeof current == "string") current = { id: "" };
            }
            return this.installed_plugins[i] ? this.installed_plugins[i].version != this.plugin.version : false;
        },
        base_path() {
            return BASE_PATH + this.$store.state.Explorer.project.explorer + "/bridge";
        },
        is_compatible() {
            return !VersionUtils.greaterThan(this.plugin.min_app_version || APP_VERSION, APP_VERSION);
        }
    },
    methods: {
        download(key=this.plugin_key) {
            this.loading = true;
            
            fetch(`${this.web_path}plugins/${key}.js`)
                .then(data => data.text())
                .then(str => {
                   let path = `${this.base_path}/plugins`;
                   if(this.plugins[key].folder) path += "/" + this.plugins[key].folder;
                   
                    mkdirp(path, (err) => {
                        if(err) throw err;
                        fs.writeFile(`${path}/${key}.js`, str, (err) => {
                            if(err) throw err;
                            this.onComplete(key);
                        });
                    });
                })
                .catch(err => {
                    console.log(err);
                    this.loading = false;
                })
        },
        onComplete(key) {
            this.total_installed++;
            
            if(this.plugins[key].dependencies == undefined && this.total_installed >= this.total_to_install) {
                this.loading = false;
                this.notification = true;
                this.total_to_install = 1;
                this.total_installed = 0;
                this.refresh();
            } else if(this.plugins[key].dependencies != undefined) {
                this.total_to_install += this.plugins[key].dependencies.length;
                this.plugins[key].dependencies.forEach(dep => {
                    this.download(dep);
                });
            }
        },
        refresh() {  
            this.$store.commit("refreshAllPlugins", true);
        }
    }
}
</script>
