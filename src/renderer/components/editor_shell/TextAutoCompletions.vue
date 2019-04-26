<template>
    <v-menu

        class="text-auto-completion-menu"
        v-model="show_menu"
        :max-height="200"
        :position-x="x + 100 + (this.is_sidebar_expanded ? 202 : 0)"
        :position-y="y + 56 + 24 +24"
        :z-index="100000"
        ref="menu"
    >
        <v-list class="text-auto-completion-list" dense>
            <v-list-tile
                v-for="(e, i) in propose"
                :key="e"
                @click="insert(e)"
            >
                <v-list-tile-title>{{ e }}</v-list-tile-title>
            </v-list-tile>
        </v-list>
    </v-menu>
</template>

<script>
    import TextProvider from "../../scripts/autoCompletions/TextProvider";
    import EventBus from "../../scripts/EventBus";
    let last_sel_object = null;
    let cursors;

    export default {
        name: "text-auto-completions",
        data() {
            return {
                show_menu: true,
                x: 100,
                y: 100,
                propose: []
            }
        },
        mounted() {
            EventBus.on("bridge:textProviderUpdate", this.updateSuggestions);
            cursors = document.getElementsByClassName("CodeMirror-cursors")[0];
        },
        destroyed() {
            EventBus.off("bridge:textProviderUpdate", this.updateSuggestions);
        },
        computed: {
            is_sidebar_expanded() {
                console.log(this.$store.state.SidebarMenu.menu_state)
                return this.$store.state.SidebarMenu.menu_state !== 0;
            }
        },
        methods: {
            updateSuggestions(propose, sel_obj) {
                last_sel_object = sel_obj;
                this.x = Number(cursors.children[0].style.left.replace("px", ""));
                this.y = Number(cursors.children[0].style.top.replace("px", ""));
                if(propose.length > 0) {
                    this.propose = propose;
                    this.show_menu = true;
                } else {
                    this.show_menu = false;
                    this.propose = [];
                }
            },
            insert(str) {
                EventBus.trigger("bridge:cmFocus");
                EventBus.trigger("setCMTextSelection", last_sel_object[0], last_sel_object[1]);
                EventBus.trigger("setCMSelection", str);
            },
            changeListIndex(event) {
                this.$refs.menu.changeListIndex(event);
            }
        }
    }
</script>

<style>
    .text-auto-completion-list a.v-list__tile {
        height: 26px !important;
    }
    .text-auto-completion-menu {
        position: relative;
    }
</style>
