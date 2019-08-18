<template>
    <v-toolbar flat height="30px">
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="refresh" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-refresh</v-icon>
                </v-btn>
            </template>
            <span>Refresh</span>
        </v-tooltip>

        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openCreateProjectWindow" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-folder-plus</v-icon>
                </v-btn>
            </template>
            <span>New Project</span>
        </v-tooltip>

        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openCreateFileWindow" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-file-document</v-icon>
                </v-btn>
            </template>
            <span>New File</span>
        </v-tooltip>

        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="packageProject" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-package-variant-closed</v-icon>
                </v-btn>
            </template>
            <span>Package</span>
        </v-tooltip>

        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openInExplorer" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-folder-multiple</v-icon>
                </v-btn>
            </template>
            <span>Open In Explorer</span>
        </v-tooltip>

        <!-- <v-spacer></v-spacer>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-dots-vertical</v-icon>
                </v-btn>
            </template>
            <span>More...</span>
        </v-tooltip> -->
    </v-toolbar>
</template>

<script>
    import { shell } from "electron";
    import CreateFileWindow from "../../../../windows/CreateFile";
    import CreateProjectWindow from "../../../../windows/CreateProject";
    import LoadingWindow from "../../../../windows/LoadingWindow";
    import ZipFolder from "zip-a-folder";

    export default {
        name: "explorer-toolbar",
        props: {
            base_path: String,
            selected: String
        },
        methods: {
            refresh() {
                this.$root.$emit("refreshExplorer");
            },
            openCreateFileWindow() {
                new CreateFileWindow();
            },
            openCreateProjectWindow() {
                new CreateProjectWindow();
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
            },
        }
    }
</script>

<style>
    nav .v-toolbar__content {
        padding: 0;
    }
</style>


<style scoped>
    button {
        padding: 0;
        width: 16px;
        height: 28px;
    }
    .v-btn {
        margin: 0;
    }
    .toolbar-button {
        height: 28px;
        width: 28px;
    }
</style>