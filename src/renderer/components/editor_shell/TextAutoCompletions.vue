<template>
    <v-menu
        class="text-auto-completion-menu"
        v-model="show_menu"
        :max-height="200"
        :position-x="x"
        :position-y="y + 32"
        ref="menu"
    >
        <v-list class="text-auto-completion-list " dense>
            <v-list-item
                v-for="(e, i) in propose"
                :class="selected === i ? 'selected' : ''"
                :ref="selected === i ? 'selected' : null"
                :key="e"
                @click="insert(e)"
            >
                <v-list-item-title>{{ e }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    import TextProvider from "../../scripts/autoCompletions/TextProvider";
    import EventBus from "../../scripts/EventBus";
    let last_sel_object = null;

    export default {
        name: "text-auto-completions",
        data() {
            return {
                show_menu: false,
                x: 100,
                y: 100,
                selected: 0,
                propose: []
            }
        },
        mounted() {
            EventBus.on("bridge:textProviderUpdate", this.updateSuggestions);
            EventBus.on("bridge:textCompletionsUp", this.textCompletionsUp);
            EventBus.on("bridge:textCompletionsDown", this.textCompletionsDown);
            EventBus.on("bridge:textCompletionsEnter", this.textCompletionsEnter);
            EventBus.on("bridge:textCompletionsOpen", this.isOpen);
            EventBus.on("bridge:closeTextCompletions", this.close);
        },
        destroyed() {
            EventBus.off("bridge:textProviderUpdate", this.updateSuggestions);
            EventBus.off("bridge:textCompletionsUp", this.textCompletionsUp);
            EventBus.off("bridge:textCompletionsDown", this.textCompletionsDown);
            EventBus.off("bridge:textCompletionsEnter", this.textCompletionsEnter);
            EventBus.off("bridge:textCompletionsOpen", this.isOpen);
            EventBus.off("bridge:closeTextCompletions", this.close);
        },
        computed: {
            is_sidebar_closed() {
                return this.$store.state.SidebarMenu.menu_state === 0;
            }
        },
        methods: {
            close() {
                this.show_menu = false;
            },
            updateSuggestions(propose, sel_obj, { top, left }={}) {
                last_sel_object = sel_obj;
                this.x = left;
                this.y = top;

                if(propose.length > 0) {
                    this.propose = propose;
                    this.selected = 0;
                    window.setTimeout(() => this.show_menu = true, 100);
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
            },

            textCompletionsUp() {
                if(this.selected > 0) this.selected--;
                this.$nextTick(() => {
                    if(this.$refs.selected[0] !== undefined) this.$refs.selected[0].$el.scrollIntoViewIfNeeded({ block: "nearest", inline: "start" }); 
                });
            },
            textCompletionsDown() {
                if(this.selected < this.propose.length - 1) this.selected++;
                this.$nextTick(() => {
                    if(this.$refs.selected[0] !== undefined) this.$refs.selected[0].$el.scrollIntoViewIfNeeded({ block: "nearest", inline: "start" }); 
                });
            },
            textCompletionsEnter() {
                this.insert(this.propose[this.selected]);
            },
            isOpen(cb) {
                cb(this.show_menu);
            }
        }
    }
</script>

<style scoped>
    .selected {
        background: rgba(119, 119, 119, 0.2);
    }
</style>


<style>
    .text-auto-completion-list .v-list-item {
        min-height: 26px !important;
        overscroll-behavior: none;
    }
    .text-auto-completion-list {
        overscroll-behavior: none;
    }
    .text-auto-completion-menu {
        overscroll-behavior: none;
    }
</style>