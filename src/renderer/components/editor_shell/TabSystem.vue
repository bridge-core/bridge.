<template>
    <v-layout :style="`overflow-x: ${is_mandatory ? 'scroll' : 'auto'}`" row wrap>
            <v-tabs slider-color="success" v-model="selected_tab" :mandatory="is_mandatory" :show-arrows="false">
                <v-tab 
                    v-for="(file, i) in open_files"
                    :key="`${selected_project}-${i}-${unsaved.join()}`"
                    bottom
                    :ripple="selected_tab !== i"
                    :class="`tab ${selected_tab == i ? 'selected' : ''}`"
                    color="red"
                > 
                    <v-tooltip :open-delay="600" transition="scale-transition" :disabled="file.file_name.length <= 27" bottom>
                        <span slot="activator" :style="`font-style: ${unsaved[i] ? 'italic' : 'none'};`">{{ getFileName(file.file_name) }}</span>
                        <span>{{ file.file_name }}</span>
                    </v-tooltip>
                    
                    <v-btn @click.stop="closeTab(i)" flat icon small><v-icon small>close</v-icon></v-btn>
                </v-tab>
            </v-tabs>
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
        EventBus.on("updateSelectedTabUI", this.updateSavedUI);
    },
    destroyed() {
        EventBus.off("updateTabUI", this.updateFiles);
        EventBus.off("updateSelectedTab", this.changeSelected);
        EventBus.off("updateSelectedTabUI", this.updateSavedUI);
    },
    computed: {
        selected_project() {
            return this.$store.state.Explorer.project.explorer;
        },
        selected_tab: {
            set(val=0) {
                this.internal_selected_tab = val;
                TabSystem.select(val);
            },
            get() {
                return this.internal_selected_tab;
            }
        },
        render_open_files() {
            return TabSystem.filtered();
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

            this.unsaved = this.open_files.map(f => f.is_unsaved === undefined ? false : f.is_unsaved);
        },
        updateSavedUI() {
            this.unsaved = this.open_files.map(f => f.is_unsaved === undefined ? false : f.is_unsaved);
        },
        getFileName(file_name) {
            return file_name.length > 27 && !file_name.includes(" ") ? file_name.substr(0, 27) + "\u2026" : file_name;
        }
    }
}
</script>

<style scoped>
    div.flex {
        padding-bottom: 0 !important;
    }

    .tab {
        text-transform: none;
        opacity: 0.5;
        
    }
    .tab:hover{
        opacity: 1;
    }
    .tab.selected {
        opacity: 1;
    }
    *::-webkit-scrollbar-track {
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
    }
    *::-webkit-scrollbar-thumb {
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
    }

    /* .v-icon {
        margin-left: 0.1em;
        opacity: 0.4;
        transition: all ease-in-out 300ms;
    }
    .v-icon:hover {
        opacity: 1;
    } */
</style>
