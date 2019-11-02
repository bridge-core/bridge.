<template>
    <div v-resize="resize">
        <v-toolbar color="expanded_sidebar" flat height="30px">
            <v-tooltip color="tooltip" bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon text @click.stop="reload" v-on="on" small class="toolbar-button">
                        <v-icon small>mdi-refresh</v-icon>
                    </v-btn>
                </template>
                <span>Reload</span>
            </v-tooltip>

            <v-tooltip color="tooltip" bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon text @click.stop="" v-on="on" small class="toolbar-button">
                        <v-icon small>mdi-magnify</v-icon>
                    </v-btn>
                </template>
                <span>Search</span>
            </v-tooltip>
        </v-toolbar>
        <v-divider/>

        <p v-if="!is_windows">
            bridge. can only load the debug log on Windows computers.
        </p>
        <v-progress-linear v-else-if="logs === null" indeterminate/>

        <div :style="`height: ${sidebar_height}px; overflow-y: auto; padding: 4px;`" v-else>
            <v-card color="expanded_sidebar" v-for="({ tags, error }, i) in logs" style="margin-bottom: 8px;" :key="i">
                <div
                    :style="`padding: 16px 16px 8px; white-space: nowrap; overflow-x: auto;`"
                    class="small-scrollbar"
                >
                    <v-chip
                        v-for="(tag, i) in tags"
                        :key="i"
                        :color="getTagColor(tag)"
                        style="margin-right: 4px; margin-bottom: 2px;"
                        small
                        
                        @click="openBrowser(tag)" 
                    >
                        <v-icon v-if="getTagIcon(tag)" left>{{ getTagIcon(tag) }}</v-icon>
                        {{ tag.toUpperCase() }}
                    </v-chip>
                </div>

                <v-divider/>
                <v-card-text>{{ error }}</v-card-text>

                <v-divider/>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn @click="parse(error)" color="primary">
                        <v-icon style="margin-right: 4px;">mdi-magnify</v-icon>
                        Open Files
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>
    </div>
</template>

<script>
    import os from "os";
    import { processedDebugLog, parseAffectedFiles } from "../../../scripts/utilities/debugLog";
    import LogListView from "../../../windows/DebugLog/ListView";
    import { tag } from '../../../windows/DebugLog/Common';
    

    export default {
        name: "debug-log",
        async mounted() {
            this.logs = await processedDebugLog();
        },
        data() {
            return {
                logs: null,
                sidebar_height: window.innerHeight - 140
            }
        },
        computed: {
            is_windows() {
                return os.platform() === "win32";
            }
        },
        methods: {
            async reload() {
                this.logs = null;
                this.logs = await processedDebugLog(true);
            },
            resize({ y = 0 }={}) {
                this.sidebar_height = (y || window.innerHeight) - 140;
            },
            parse(log) {
                parseAffectedFiles(log);
            },
            openBrowser(tag) {
                new LogListView(tag);
            },
            getTagColor(t) {
                return tag(t).color;
            },
            getTagIcon(t) {
                return tag(t).icon;
            }
        }
    }
</script>

<style scoped>
    p {
        padding: 0.5em;
    }
    .small-scrollbar::-webkit-scrollbar {
        width: 3px;
        height: 3px;
    }
</style>