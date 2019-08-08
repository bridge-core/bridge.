<template>
    <v-menu
        v-model="shown"
        :offset-y="!is_submenu"
        :offset-x="is_submenu"
        :open-on-hover="is_submenu"
        min-width="260px"
        :class="is_submenu ? 'sidemenu' : ''"
    >
        <template v-slot:activator="{ on }">
            <v-btn v-if="!is_submenu" v-on="on" tile class="app-menu-item" small text>
                {{ menu.display_name }}
            </v-btn>

            <v-list-item v-else v-on="on">
                <v-list-item-content>
                    <v-list-item-title>{{ submenu.title }}</v-list-item-title>
                    <v-list-item-subtitle v-if="submenu.subtitle">{{ submenu.subtitle }}</v-list-item-subtitle>
                </v-list-item-content>
                
                <v-list-item-action>
                    <v-icon small>mdi-chevron-right</v-icon>
                </v-list-item-action>
            </v-list-item>
        </template>

        <v-list ref="main_menu" class="list app-menu" dense>
            <app-menu-element 
                v-for="(element, i) in menu.elements"
                :key="i"
                :element="element"
            >
                <app-menu 
                    slot-scope="props"
                    :menu="props.menu"
                    :submenu="props.submenu"
                />
            </app-menu-element>
        </v-list>
    </v-menu>
</template>

<script>
    import AppMenuElement from "./AppMenuElement.vue";

    export default {
        name: "app-menu",
        components: {
            AppMenuElement
        },
        props: {
            menu: Object,
            submenu: Object
        },
        data() {
            return {
                shown: false
            };
        },
        created() {
            window.addEventListener("resize", this.on_resize);

            this.$root.$on("close-all-menus", () => {
                this.shown = false;
            });
        },
        destroyed() {
            window.removeEventListener("resize", this.on_resize);
        },
        computed: {
            is_submenu() {
                return this.submenu != undefined;
            }
        },
        methods: {
            setMenuMaxHeights(val) {
                if(this.$refs.main_menu) this.$refs.main_menu.$el.style.maxHeight = val + "px";
                if(this.$refs.sub_menu) this.$refs.sub_menu.$el.style.maxHeight = val + "px";
            },
            on_resize() {
                this.setMenuMaxHeights(window.innerHeight - 75);
            }
        }
    }
</script>

<style scoped>
    .v-btn {
        -webkit-app-region: no-drag;
        min-width: 0;
        padding: 0;
    }
    .sidemenu, .sidemenu div {
        width: 100%;
    }
    .list {
        overflow-y: auto;
    }
</style>
<style>
    .app-menu .v-list__tile {
        height: 30px !important;
    }
    .app-menu-item {
        padding: 0;
    }
</style>
