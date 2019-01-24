<template>
    <v-layout :style="`overflow-x: ${is_mandatory ? 'scroll' : 'auto'}`" row wrap>
          <v-flex xs12 sm6 class="py-2">
            <v-btn-toggle v-model="selected_tab" :mandatory="is_mandatory">
                <v-tooltip v-for="(file, i) in open_files" :key="`${selected_project}-${i}-${unsaved}`" :disabled="selected_tab != i || true" bottom>
                    <span slot="activator">
                        <v-btn flat :ripple="selected_tab != i">
                            <span :style="`font-style: ${unsaved[i] ? 'italic' : 'none'};`">{{ file.file_name }}</span>
                            <v-icon @click.stop="closeTab(i)" ripple small>close</v-icon>
                        </v-btn>
                    </span>
                    <span>{{ file.file_path.replace(/\\/g, "/") }}</span>
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
            internal_selected_tab: TabSystem.selected,
            unsaved: []
        };
    },
    created() {
        EventBus.on("updateTabUI", this.updateFiles);
        EventBus.on("updateSelectedTab", this.changeSelected);
        EventBus.on("updateSelectedTabUI", (val) => {
            this.unsaved = [];
            this.open_files.forEach(f => this.unsaved.push(f.is_unsaved == undefined ? false : f.is_unsaved));
        });
    },
    destroyed() {
        EventBus.off("updateTabUI", this.updateFiles);
        EventBus.off("updateSelectedTab", this.changeSelected);
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

        is_mandatory() {
            return this.open_files.length > 0;
        }
    },
    methods: {
        closeTab(i) {
            TabSystem.closeById(i);
        },
        changeSelected() {
            this.internal_selected_tab = TabSystem.selected;
        },
        updateFiles() {
            this.open_files = TabSystem.filtered();
            this.unsaved = [];
            this.open_files.forEach(f => this.unsaved.push(f.is_unsaved == undefined ? false : f.is_unsaved));
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
