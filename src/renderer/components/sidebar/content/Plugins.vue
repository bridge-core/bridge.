<template>
    <div>
        <v-toolbar flat height="30px">
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon text @click.stop="is_menu_open = true" v-on="on" small class="toolbar-button">
                        <v-icon small>mdi-settings</v-icon>
                    </v-btn>
                </template>
                <span>Manage</span>
            </v-tooltip>
        </v-toolbar>
        <v-divider/>

        <div class="container" :style="`height: ${plugin_height}px;`">
            <span v-if="plugins.length == 0">It doesn't look like you have installed an extension yet.</span>

            <v-expansion-panel v-if="unknown_plugins > 0">
                <v-expansion-panel-header>Unknown Plugins</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-card>
                        <v-list dense>
                            <p>
                                {{ unknown_plugins }} plugin{{ unknown_plugins > 1 ? "s are" : " is" }} not registered correctly. 
                                Please update {{ unknown_plugins > 1 ? "them" : "it" }} accordingly. In the future this might cause a plugin to not load!
                            </p>
                            <v-tooltip right>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on"
                                        @click.stop="openLink('https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md')"
                                        text
                                        icon
                                        small>
                                        <v-icon small>mdi-information</v-icon>
                                    </v-btn>
                                </template>
                                <span>More...</span>
                            </v-tooltip>
                        </v-list>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-card v-for="(plugin, i) in plugins" style="margin-bottom: 8px;" :key="`plugin-sidebar-display-${i}`">
                <v-list three-line>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>{{ plugin.name }}</v-list-item-title>
                            <v-list-item-subtitle class="text--primary">by {{ plugin.author }}</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-list-item-action-text>{{ plugin.version }}</v-list-item-action-text>

                            <v-tooltip color="info" right v-if="plugin.link !== undefined">
                                <template v-slot:activator="{ on }">
                                    <v-icon @click.stop.native="openLink(plugin.link)" v-on="on" color="info">
                                        mdi-earth
                                    </v-icon>
                                </template>
                                <span>More...</span>
                            </v-tooltip>

                            <v-tooltip color="primary" right v-if="plugin.id && !uninstalled_plugins().includes(plugin.id)">
                                <template v-slot:activator="{ on }">
                                    <v-icon v-on="on" color="success">
                                        mdi-check
                                    </v-icon>
                                </template>
                                <span>Active</span>
                            </v-tooltip>
                            <v-tooltip color="error" right v-else-if="!plugin.id">
                                <template v-slot:activator="{ on }">
                                    <v-icon v-on="on" color="error">
                                        mdi-alert-circle
                                    </v-icon>
                                </template>
                                <span>Not Loaded: No valid ID assigned</span>
                            </v-tooltip>
                            <v-tooltip color="error" right v-else>
                                <template v-slot:activator="{ on }">
                                    <v-icon v-on="on" color="error">
                                        mdi-close
                                    </v-icon>
                                </template>
                                <span>Inactive</span>
                            </v-tooltip>
                        </v-list-item-action>
                    </v-list-item>
                    <div class="padding">
                        {{ plugin.description }}
                    </div>
                </v-list>
            </v-card>
        </div>
    </div>
</template>

<script>
    import { shell } from "electron";
    import PluginEnv from "../../../scripts/plugins/PluginEnv";
    import fs from "fs";

    export default {
        name: "content-plugins",
        created() {
            window.addEventListener("resize", this.on_resize);
        },
        destroyed() {
            window.removeEventListener("resize", this.on_resize);
        },
        data() {
            return {
                plugin_height: window.innerHeight - 140
            }
        },
        computed: {
            plugins() {
                return this.$store.state.Plugins.installed_plugins.filter(plugin => plugin != "unknown" && plugin != "module");
            },
            unknown_plugins() {
                return this.$store.getters.unknown_plugins;
            },
            is_menu_open: {
                set(val) {
                    this.$store.commit("setPluginMenuOpen", val)
                },
                get() {
                    return this.$store.state.Plugins.is_menu_open;
                }
            }
        },
        methods: {
            on_resize() {
                this.plugin_height = window.innerHeight - 140;
            },
            openLink(link) {
                shell.openExternal(link);
            },

            uninstalled_plugins() {
                let path = PluginEnv.Runtime.getBridgePath() + "uninstalled_plugins.json";
                try {
                    return JSON.parse(fs.readFileSync(path));
                } catch(e) {
                    return [];
                }
            }
        }
    }
</script>

<style scoped>
    div.container {
        padding: 4px;
        overflow-y: auto;
    }

    p {
        padding: 0.2em;
        display: block;
        margin: 0;
    }
    i {
        cursor: pointer;
    }
    .toolbar-button {
        height: 28px;
        width: 28px;
    }

    .padding {
        padding: 0 16px 16px 16px;
    }
    .v-expansion-panel {
        margin-bottom: 0.2em;
    }
</style>