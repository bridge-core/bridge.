<template>
    <v-toolbar color="expanded_sidebar" flat height="30px">
        <v-tooltip color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="refresh" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-refresh</v-icon>
                </v-btn>
            </template>
            <span>Refresh</span>
        </v-tooltip>

        <v-tooltip color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openCreateProjectWindow" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-folder-plus</v-icon>
                </v-btn>
            </template>
            <span>New Project</span>
        </v-tooltip>

        <v-tooltip color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openCreateFileWindow" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-file-document</v-icon>
                </v-btn>
            </template>
            <span>New File</span>
        </v-tooltip>

        <v-tooltip color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="packageProject" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-package-variant-closed</v-icon>
                </v-btn>
            </template>
            <span>Package</span>
        </v-tooltip>

        <v-tooltip color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="openInExplorer" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-folder-multiple</v-icon>
                </v-btn>
            </template>
            <span>Open In Explorer</span>
        </v-tooltip>

        <v-spacer/>
        <v-menu content-class="json-input-suggestions" v-if="menu_elements.length" dense offset-y>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-dots-vertical</v-icon>
                </v-btn>
            </template>
            <v-list color="menu">
                <v-list-item
                    v-for="({ action, title, icon }, index) in menu_elements"
                    :key="index"
                    @click="action"
                >
                    <v-list-item-icon v-if="icon" style="margin: 4px 12px 4px 0;"><v-icon>{{ icon }}</v-icon></v-list-item-icon>
                    <v-list-item-title>{{ title }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-toolbar>
</template>

<script>
    import { shell } from "electron";
    import CreateFileWindow from "../../../../windows/CreateFile";
    import CreateProjectWindow from "../../../../windows/CreateProject";
    import LoadingWindow from "../../../../windows/LoadingWindow";
    import ZipFolder from "zip-a-folder";
    import { join } from "path";
    import InputWindow from "../../../../scripts/commonWindows/Input";
    import ProjectConfig from "../../../../scripts/ProjectConfig";

    export default {
        name: "explorer-toolbar",
        props: {
            base_path: String,
            selected: String
        },
        data() {
            return {
                menu_elements: [
                    {
                        icon: "mdi-rename-box",
                        title: "Project Namespace",
                        action: async () => {
                            let prefix;
                            try { prefix = await ProjectConfig.prefix; }
                            catch(e) { prefix = "bridge" }

                            new InputWindow({
                                header: "Project Namespace",
                                label: "Namespace",
                                text: prefix
                            }, (val) => {
                                ProjectConfig.setPrefix(val);
                            })
                        }
                    }
                ]
            }
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
                ZipFolder.zipFolder(path, join(path, `${project}.mcpack`), err => {
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
