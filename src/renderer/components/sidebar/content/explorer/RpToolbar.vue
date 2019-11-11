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

        <v-tooltip  color="tooltip" bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon text @click.stop="deleteRP" v-on="on" class="toolbar-button" small>
                    <v-icon small>mdi-delete</v-icon>
                </v-btn>
            </template>
            <span>Delete Pack</span>
        </v-tooltip>
    </v-toolbar>
</template>

<script>
    import { shell } from "electron";
    import CreateFileWindow from "../../../../windows/CreateFile";
    import LoadingWindow from "../../../../windows/LoadingWindow";
    import { zip } from "zip-a-folder";
    import PackLinker from "../../../../scripts/utilities/LinkPacks";
    import { CURRENT } from '../../../../scripts/constants';
    import { MOJANG_PATH } from '../../../../../shared/Paths';
    import { join } from "path";
    import Notification from '../../../../scripts/Notification';
    import ConfirmWindow from '../../../../scripts/commonWindows/Confirm';
    import trash from 'trash';
    import EventBus from '../../../../scripts/EventBus';

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
                PackLinker.unlink(CURRENT.PROJECT);
            },
            openCreateFileWindow() {
                new CreateFileWindow(true);
            },
            async packageProject() {
                let lw = new LoadingWindow();
                await zip(CURRENT.RP_PATH, join(MOJANG_PATH, `${this.selected}.mcpack`));
                lw.close();

                const ready_push = new Notification({
                    display_icon: "mdi-package-variant-closed",
                    display_name: "Package ready!",
                    color: "info",
                    action: () => {
                        ready_push.remove();
                        shell.openExternal(MOJANG_PATH);
                    }
                }).send();
            },
            openInExplorer() {
                shell.openExternal(this.base_path + this.selected);
            },
            deleteRP() {
                new ConfirmWindow(async () => {
                    let lw = new LoadingWindow();
                    PackLinker.unlink(CURRENT.PROJECT);
                    await trash(CURRENT.RP_PATH);
                    lw.close();
                }, null, "Do you really want to delete this pack?");
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