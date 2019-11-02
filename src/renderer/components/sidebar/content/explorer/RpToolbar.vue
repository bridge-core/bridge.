<template>
    <v-toolbar color="expanded_sidebar" flat height="30px">
        <v-tooltip color="tooltip" bottom class="first">
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="refresh" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-refresh</v-icon>
                </v-btn>
            </template>
            <span>Refresh</span>
        </v-tooltip>

        <v-tooltip color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="unlink" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-lock-open</v-icon>
                </v-btn>
            </template>
            <span>Unlink RP</span>
        </v-tooltip>

        <v-tooltip  color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openCreateFileWindow" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-file-document</v-icon>
                </v-btn>
            </template>
            <span>New File</span>
        </v-tooltip>

        <v-tooltip  color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="packageProject" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-package-variant-closed</v-icon>
                </v-btn>
            </template>
            <span>Package</span>
        </v-tooltip>

        <v-tooltip  color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openInExplorer" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-folder-multiple</v-icon>
                </v-btn>
            </template>
            <span>Open In Explorer</span>
        </v-tooltip>
    </v-toolbar>
</template>

<script>
    import { shell } from "electron";
    import CreateFileWindow from "../../../../windows/CreateFile";
    import LoadingWindow from "../../../../windows/LoadingWindow";
    import ZipFolder from "zip-a-folder";
    import PackLinker from "../../../../scripts/utilities/LinkPacks";

    export default {
        name: "explorer-rp-toolbar",
        props: {
            base_path: String,
            selected: String
        },
        methods: {
            refresh() {
                this.$root.$emit("refreshExplorer");
            },
            unlink() {
                PackLinker.unlink(this.$store.state.Explorer.project.explorer);
            },
            openCreateFileWindow() {
                new CreateFileWindow(true);
            },
            packageProject() {
                let lw = new LoadingWindow();
                let project = this.selected;
                let path = this.base_path + project;
                ZipFolder.zipFolder(path, `${path}\\${project}.mcpack`, err => {
                    if(err) console.error(err);
                    this.refresh();
                    lw.close();
                });
            },
            openInExplorer() {
                shell.openExternal(this.base_path + this.selected);
            }
        }
    }
</script>

<style scoped>
    .toolbar-button {
        height: 28px;
        width: 28px;
    }
</style>