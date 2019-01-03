<template>
    <v-toolbar fixed app clipped height="24px">
        <v-toolbar-items>
            <app-menu v-for="(menu, i) in menu_details" :key="i" :menu="menu"></app-menu>
        </v-toolbar-items>
        

        <v-spacer></v-spacer>

        <v-toolbar-items>
            <v-btn small icon @click.stop="minWindow">
                <v-icon small>minimize</v-icon>
            </v-btn>
            <v-btn small icon @click.stop="maxWindow">
                <v-icon small>add</v-icon>
            </v-btn>
            <v-btn small icon @click.stop="closeWindow" class="last-btn">
                <v-icon small>close</v-icon>
            </v-btn>
        </v-toolbar-items>
    </v-toolbar>
</template>

<script>
    import AppMenu from "./AppMenu";
    import { remote } from "electron";
    import MouseTrap from "mousetrap";
    import KeyManager from "../scripts/appMenu/KeyManager";

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
                is_maximized: false
            };
        },
        computed: {
            menu_details() {
                return this.$store.state.AppMenu;
            }
        },
        methods: {
            closeWindow() {
                remote.getCurrentWindow().close();
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

<style scoped>
    .v-toolbar {
        -webkit-app-region: drag;
    }

    .v-toolbar button, .v-btn {
        -webkit-app-region: no-drag;
        min-width: 0;
    }

    .v-toolbar__content > *:last-child.v-btn--icon, .v-toolbar__extension > *:last-child.v-btn--icon {
        margin-right: 0;
    }
</style>