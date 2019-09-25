<template>
    <v-system-bar color="toolbar" class="main-app-toolbar" :style="`padding-left: ${is_mac_os ? 0: 8}px;`" fixed app clipped padless height="24px">
        <img v-if="!is_mac_os" :src="icon_path" style="height: 16px; padding-right: 4px;"/>
        <v-toolbar-items class="px14-font">
            <v-divider vertical/>
            <template v-for="(menu, key, i) in menu_details">
                <app-menu :key="`app-menu-${key}`" :menu="menu"></app-menu>
                <v-divider v-if="i + 1 < Object.keys(menu_details).length" :key="`divider-${key}`" vertical/>
            </template>
        </v-toolbar-items>
        
        <v-spacer></v-spacer>

        <v-toolbar-items v-if="!is_mac_os">
            <v-btn small icon @click.stop="minWindow">
                <v-icon small>mdi-minus</v-icon>
            </v-btn>
            <v-divider vertical/>
            <v-btn small icon @click.stop="maxWindow">
                <v-icon small>mdi-plus</v-icon>
            </v-btn>
            <v-divider vertical/>
            <v-btn color="error" small icon @click.stop="closeWindow">
                <v-icon small>mdi-close</v-icon>
            </v-btn>
        </v-toolbar-items>
    </v-system-bar>
</template>

<script>
    import path from "path";
    import DataUrl from "dataurl";
    import fs from "fs";
    import AppMenu from "./AppMenu";
    import { remote } from "electron";
    import MouseTrap from "mousetrap";
    import KeyManager from "../scripts/appMenu/KeyManager";
    import TabSystem from '../scripts/TabSystem';
    import ConfirmWindow from '../scripts/commonWindows/Confirm';

    export default {
        name: "app-toolbar",
        components: {
            AppMenu
        },
        created() {
            //BIND MOUSETRAP EVENTS
            let menus = this.$store.state.AppMenu;

            for(let menu_name in menus) {
                KeyManager.bind(menus[menu_name].elements, menus[menu_name]);
            }
        },
        destroyed() {
            //UNBIND MOUSETRAP EVENTS
            MouseTrap.reset();
        },
        data() {
            return {
                is_maximized: false,
                icon_path: DataUrl.convert({
                    data: fs.readFileSync(path.join(__static, "/icon.png")),
                    mimetype: `image/png`
                })
            };
        },
        // watch: {
        //     is_dark_mode(is_dark_mode) {
        //         this.icon_path = DataUrl.convert({
        //             data: fs.readFileSync(path.join(__static, is_dark_mode ? "/icon.png" : "/icon_light.png")),
        //             mimetype: `image/png`
        //         })
        //     }
        // },
        computed: {
            menu_details() {
                return this.$store.state.AppMenu;
            },
            is_mac_os() {
                return process.platform === "darwin";
            },
            // is_dark_mode() {
            //     return this.$store.state.Appearance.is_dark_mode;
            // }
        },
        methods: {
            closeWindow() {
                if(TabSystem.contains_unsaved) {
                    new ConfirmWindow(() => remote.getCurrentWindow().close(), null, "Not all of your open tabs are saved. Do you really want to close \"bridge.\"?");
                } else {
                    remote.getCurrentWindow().close()
                }
            },
            minWindow() {
                remote.getCurrentWindow().minimize();
            },
            maxWindow() {
                if (this.is_maximized) {
                    remote.getCurrentWindow().unmaximize();
                } else {
                    remote.getCurrentWindow().maximize();
                }

                this.is_maximized = !this.is_maximized;
            }
        }
    }
</script>

<style>
    .v-system-bar.main-app-toolbar {
        -webkit-app-region: drag;
    }

    .v-system-bar.main-app-toolbar button, .v-btn {
        -webkit-app-region: no-drag;
        min-width: 0;
    }
</style>