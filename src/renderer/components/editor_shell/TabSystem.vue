<template>
    <v-layout :style="`overflow-x: ${is_mandatory ? 'scroll' : 'auto'}`" row wrap>
          <v-flex xs12 sm6 class="py-2">
            <v-btn-toggle v-model="selected_tab" :mandatory="is_mandatory">
                <v-tooltip v-for="(file, i) in open_files" :key="`${selected_project}-${i}`" :disabled="hide_tooltip" bottom>
                    <span slot="activator">
                        <v-btn flat :ripple="selected_tab != i">
                            {{ file.file_name }}
                            <v-icon @click.stop="closeTab(i)" ripple small>close</v-icon>
                        </v-btn>
                    </span>
                    <span>{{ file.category }}</span>
                </v-tooltip>
            </v-btn-toggle>
          </v-flex>
    </v-layout>
</template>

<script>
import TabSystem from "../../scripts/TabSystem";
import EventBus from "../../scripts/EventBus";

export default {
    name: "editor-shell-tab-system",
    data() {
        return {
            open_files: TabSystem.filtered(),
            internal_selected_tab: TabSystem.selected
        };
    },
    created() {
        EventBus.on("updateTabUI", () => {
            this.open_files = TabSystem.filtered();
        });
        EventBus.on("updateSelectedTab", () => {
            this.internal_selected_tab = TabSystem.selected;
        });
    },
    destroyed() {
        EventBus.off("updateTabUI");
    },
    computed: {
        selected_project() {
            return this.$store.state.Explorer.project;
        },
        selected_tab: {
            set(val) {
                TabSystem.select(val);
            },
            get() {
                return this.internal_selected_tab;
            }
        },

        hide_tooltip() {
            return true;
        },
        is_mandatory() {
            return this.open_files.length > 0;
        }
    },
    methods: {
        closeTab(i) {
            TabSystem.closeById(i);
        }
    }
}
</script>

<style scoped>
    div.flex {
        padding-bottom: 0 !important;
    }

    button.v-btn {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        text-transform: none;
    }
    *::-webkit-scrollbar-track {
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
    }
    *::-webkit-scrollbar-thumb {
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
    }

    .v-icon {
        margin-left: 0.1em;
        opacity: 0.2;
        transition: all ease-in-out 300ms;
    }
    .v-icon:hover {
        opacity: 1;
    }
</style>
