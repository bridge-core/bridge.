<template>
    <v-navigation-drawer :style="`max-height: ${nav_height}px;`" fixed mini-variant-width="60" mini-variant stateless value="true" app>
        <v-toolbar fixed height="24px" width="60">
            <h4>bridge.</h4>
        </v-toolbar>

        <v-list :style="`max-height: ${nav_height}px;`">
            <v-tooltip v-for="(item, i) in menu_items" :key="i" right>
                <v-list-tile slot="activator" @click="toggleMenu(i+1)">

                    <v-list-tile-action>
                        <v-layout align-center>
                            <v-icon medium :style="`opacity: ${getOpacity(i)};`">{{ item.icon }}</v-icon>
                        </v-layout>

                    </v-list-tile-action>
                </v-list-tile>
                <span>{{ item.title }}</span>
            </v-tooltip>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
    export default {
        name: "sidebar-navigation",
        created() {
            window.addEventListener("resize", this.on_resize);
        },
        destroyed() {
            window.removeEventListener("resize", this.on_resize);
        },
        computed: {
            sidebar_menu_state() {
                return this.$store.state.SidebarMenu.menu_state;
            },
            menu_items() {
                return this.$store.getters.all_items;
            }
        },
        data() {
            return {
                nav_height: window.innerHeight
            };
        },
        methods: {
            isActive(i) {
                return this.sidebar_menu_state == i+1;
            },
            getOpacity(i) {
                return this.isActive(i) ? 1 : 0.25;
            },
            toggleMenu(i) {
                if (this.sidebar_menu_state == i) {
                    this.$store.commit("setSidebarMenu", 0);
                } else {
                    this.$store.commit("setSidebarMenu", i);
                }
            },
            on_resize() {
                this.nav_height = window.innerHeight;
            }
        }
    }
</script>

<style scoped>
    .v-list {
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>
