<template>
    <v-dialog
        v-model="is_menu_open"
        scrollable
        persistent
        :max-width="is_fullscreen ? 2000 : 500"
    >
        <v-card ref="movable_card">
            <v-toolbar @dblclick.native="is_fullscreen = !is_fullscreen" ref="drag_region" height="30px">
                <span class="window-title">Extensions</span>
                <v-spacer></v-spacer>
                <v-btn small icon @click.stop="is_fullscreen = !is_fullscreen">
                    <v-icon small>add</v-icon>
                </v-btn>
                <v-btn small icon @click.stop="is_menu_open = false" class="last-btn">
                    <v-icon small>close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text :style="`height: ${is_fullscreen ? 2000 : 500}px;`">
                <plugin-list v-if="filter != 'web'" :plugins="plugins" :filter="filter" :is_fullscreen="is_fullscreen"></plugin-list>
                <web-plugins v-else :is_fullscreen="is_fullscreen" :plugins="web_plugins" :installed_plugins="plugins"></web-plugins>
            </v-card-text>

            <v-card-actions>
                <v-bottom-nav
                    :active.sync="filter"
                    :value="true"
                    absolute
                    color="transparent"
                >
                    <v-btn flat value="active">
                        <span>Active</span>
                        <v-icon>bookmark</v-icon>
                    </v-btn>

                    <v-btn flat value="available">
                        <span>Available</span>
                        <v-icon>apps</v-icon>
                    </v-btn>

                    <v-btn flat value="web">
                        <span>Web</span>
                        <v-icon>cloud</v-icon>
                    </v-btn>
                </v-bottom-nav>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import PluginList from "./PluginList";
import WebPlugins from "./WebPlugins";
import { setTimeout } from 'timers';

export default {
    name: "plugin-install-main",
    components: {
        PluginList,
        WebPlugins
    },
    data() {
        return {
            is_fullscreen: false,
            filter: "active",
            web_plugins: undefined
        }
    },
    props: {
        is_draggable: {
            default: false,
            type: Boolean
        }
    },
    mounted() {
        fetch("https://solveddev.github.io/bridge-plugins/plugins.json")
            .then(data => data.json())
            .then(obj => this.web_plugins = obj)
            .catch(err => err ? console.warn(err) : null)
    },
    computed: {
        is_menu_open: {
            set(val) {
                this.$store.commit("setPluginMenuOpen", val)
            },
            get() {
                return this.$store.state.Plugins.is_menu_open;
            }
        },

        plugins() {
            return this.$store.state.Plugins.installed_plugins;
        }
    }
}
</script>

<style scoped>
    .last-btn {
        margin-right: 4px !important;
    }
    .window-title {
        margin-left: 8px;
        cursor: default;
    }
</style>
