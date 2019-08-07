<template>
    <v-toolbar flat height="30px">
        <v-tooltip bottom class="first">
            <v-btn icon flat @click.stop="refresh" slot="activator" small>
                <v-icon small>mdi-refresh</v-icon>
            </v-btn>
            <span>Refresh</span>
        </v-tooltip>

        <v-tooltip bottom>
            <v-btn icon flat @click.stop="openCreateFileWindow" slot="activator" small>
                <v-icon small>mdi-file-document</v-icon>
            </v-btn>
            <span>New File</span>
        </v-tooltip>

        <v-tooltip bottom>
            <v-btn icon flat @click.stop="packageProject" slot="activator" small>
                <v-icon small>mdi-package-variant-closed</v-icon>
            </v-btn>
            <span>Package</span>
        </v-tooltip>

        <v-tooltip bottom>
            <v-btn icon flat @click.stop="openInExplorer" slot="activator" small>
                <v-icon small>mdi-folder-multiple</v-icon>
            </v-btn>
            <span>Open In Explorer</span>
        </v-tooltip>
    </v-toolbar>
</template>

<script>
    import { shell } from "electron";
    import CreateFileWindow from "../../../../windows/CreateFile";
    import LoadingWindow from "../../../../windows/LoadingWindow";
    import ZipFolder from "zip-a-folder";

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
    .first {
        padding-left: 0.1em;
    }
</style>