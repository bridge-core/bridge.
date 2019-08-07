<template>
    <div>
        <v-toolbar flat height="30px">
            <v-tooltip bottom class="first">
                <v-btn slot="activator" @click.stop="is_menu_open = true" class="first" small icon>
                    <v-icon small>mdi-settings</v-icon>
                </v-btn>
                <span>Manage</span>
            </v-tooltip>
        </v-toolbar>

        <v-container :style="`max-height: ${plugin_height}px;`">
            <span v-if="plugins.length == 0">It doesn't look like you have installed an extension yet.</span>

            <v-expansion-panel v-if="unknown_plugins > 0">
                <v-expansion-panel-content>
                    <span slot="header">Unknown Plugins</span>
                    <v-card>
                        <v-list dense>
                            <p>
                                {{ unknown_plugins }} plugin{{ unknown_plugins > 1 ? "s are" : " is" }} not registered correctly. 
                                Please update {{ unknown_plugins > 1 ? "them" : "it" }} accordingly. In the future this might cause a plugin to not load!
                            </p>
                            <v-tooltip right>
                                <v-btn slot="activator"
                                    @click.stop="openLink('https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md')"
                                    flat
                                    icon
                                    small>
                                    <v-icon small>mdi-information</v-icon>
                                </v-btn>
                                <span>More...</span>
                            </v-tooltip>
                        </v-list>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-card>
                <v-list v-for="(plugin, i) in plugins" :key="`plugin-sidebar-display-${i}`" three-line>
                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ plugin.name }}</v-list-tile-title>
                            <v-list-tile-sub-title class="text--primary">by {{ plugin.author }}</v-list-tile-sub-title>
                            
                        </v-list-tile-content>

                        <v-list-tile-action>
                            <v-list-tile-action-text>{{ plugin.version }}</v-list-tile-action-text>

                            <v-tooltip right v-if="plugin.link != undefined">
                                <v-icon @click.stop.native="openLink(plugin.link)" slot="activator" color="primary">
                                    mdi-earth
                                </v-icon>
                                <span>More...</span>
                            </v-tooltip>

                            <v-tooltip right v-if="!uninstalled_plugins().includes(plugin.id)">
                                <v-icon slot="activator" color="success">
                                    mdi-check
                                </v-icon>
                                <span>Active</span>
                            </v-tooltip>
                            <v-tooltip right v-else>
                                <v-icon slot="activator" color="error">
                                    mdi-close
                                </v-icon>
                                <span>Inactive</span>
                            </v-tooltip>
                        </v-list-tile-action>
                    </v-list-tile>
                    <div class="padding">{{ plugin.description }}</div>
                    <v-divider v-if="i < plugins.length - 1"></v-divider>
                </v-list>
            </v-card>
        </v-container>
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
    button {
        padding: 0;
        width: 16px;
        height: 28px;
    }

    .padding {
        padding: 0 16px 16px 16px;
    }
    .v-expansion-panel {
        margin-bottom: 0.2em;
    }
    .v-btn {
        margin: 0;
    }
    .first {
        padding-left: 0.1em;
    }
</style>