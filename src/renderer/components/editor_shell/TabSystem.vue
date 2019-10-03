<template>
    <div
        v-if="has_tabs"
        :style="`display: inline-block; overflow-x: scroll; white-space: nowrap; width: 100%;`"
    >
        <v-tab 
            v-for="(file, i) in open_files"
            :key="`${selected_project}-${i}-${unsaved.join()}`"
            :ripple="selected_tab !== i"
            :class="`tab ${selected_tab == i ? 'selected' : ''}`"
            :style="`display: inline-block; border-bottom: 2px solid var(--v-background-darken2); background: var(--v-background-darken1);`"
            @click.native="selected_tab = i"
        >
            <v-btn
                v-if="showDocButton(file.file_path)"
                color="primary"
                @click.stop="openDoc(file.file_path)"
                text
                icon
                small
            >
                <v-icon small>mdi-book-open-page-variant</v-icon>
            </v-btn>

            <v-tooltip color="tooltip" :open-delay="600" transition="scale-transition" :disabled="file.file_name.length <= 27" bottom>
                <template v-slot:activator="{ on }">
                    <span v-on="on" :style="`font-style: ${unsaved[i] ? 'italic' : 'none'};`">{{ getFileName(file.file_name) }}</span>
                </template>
                <span>{{ file.file_name }}</span>
            </v-tooltip>

            <v-btn @click.stop="closeTab(i)" text icon small><v-icon small>mdi-close</v-icon></v-btn>
        </v-tab>
    </div>
</template>

<script>
import TabSystem from "../../scripts/TabSystem";
import EventBus from "../../scripts/EventBus";
import FileType from '../../scripts/editor/FileType';
import { shell } from 'electron';
import { DOC_URL } from '../../scripts/constants';

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

        has_tabs() {
            return this.open_files.length > 0;
        },
        is_dark_mode() {
            return this.$store.state.Appearance.is_dark_mode;
        },
        is_sidebar_open() {
            return this.$store.state.SidebarMenu.menu_state > 0;
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

            this.unsaved = this.open_files.map(f => f.is_unsaved === undefined ? false : f.is_unsaved && !f.is_immutable);
        },
        updateSavedUI() {
            this.unsaved = this.open_files.map(f => f.is_unsaved === undefined ? false : f.is_unsaved && !f.is_immutable);
        },
        getFileName(file_name) {
            return file_name.length > 27 && !file_name.includes(" ") ? file_name.substr(0, 27) + "\u2026" : file_name;
        },

        showDocButton(file_path) {
            let file_data = (FileType.getData(file_path) || {});
            return file_data.file_viewer !== "json" && file_data.documentation !== undefined;
        },
        openDoc(file_path) {
            shell.openExternal(`${DOC_URL}${encodeURI(FileType.getData(file_path).documentation)}`);
        }
    }
}
</script>

<style scoped>
    div.flex {
        padding-bottom: 0 !important;
    }

    .tab {
        padding: 8px 16px;
        text-transform: none;
        opacity: 0.5;
    }
    .tab:hover{
        opacity: 1;
    }
    .tab.selected {
        opacity: 1;
        border-bottom: 2px solid var(--v-primary-base) !important;
        color: var(--v-primary-base);
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
