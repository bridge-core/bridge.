<template>
    <div>
        <v-toolbar color="expanded_sidebar" flat height="30px">
            <v-tooltip color="tooltip" bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon text @click.stop="reset" v-on="on" class="toolbar-button" small>
                        <v-icon small>mdi-refresh</v-icon>
                    </v-btn>
                </template>
                <span>Refresh</span>
            </v-tooltip>

            <v-tooltip color="tooltip" bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon text @click.stop="search_all = !search_all" v-on="on" class="toolbar-button" small>
                        <v-icon v-if="!search_all" small>mdi-numeric-1-circle</v-icon>
                        <v-icon v-else small>mdi-alpha-a-circle</v-icon>
                    </v-btn>
                </template>
                <span v-if="!search_all">Search Current File</span>
                <span v-else>Search All Files</span>
            </v-tooltip>
        </v-toolbar>
        <v-divider/>

        <v-container>
            <v-text-field
                label="Search"
                append-outer-icon="mdi-magnify"
                hide-details
                solo
                dense
                v-model="search_val"
                @click:append-outer="search"
                @keydown.enter.native="search"
            />
            <v-text-field
                label="Replace"
                append-outer-icon="mdi-chevron-right"
                style="margin: 8px 0;"
                hide-details
                solo
                dense
                v-model="replace_val"
                @click:append-outer="replace"
                @keydown.enter.native="replace"
            />
            <v-divider/>

            Selected Nodes: {{ selected_nodes }}
        </v-container>
    </div>
</template>

<script>
import TabSystem from '../../../scripts/TabSystem';
import JSONTree from '../../../scripts/editor/JsonTree';
import InformationWindow from '../../../scripts/commonWindows/Information';

export default {
    name: "content-file-search",
    data() {
        return {
            search_val: "",
            replace_val: "",
            search_all: false,
            selection: []
        }
    },
    computed: {
        selected_nodes() {
            return this.selection.reduce((prev, curr) => prev + curr.nodes.length, 0);
        }
    },
    methods: {
        search() {
            if(this.search_all) {

            } else {
                let sel = TabSystem.getSelected();
                if(!sel) return new InformationWindow("ERROR", "You need to open a file to get started with file search.");

                let c = sel.content;
                if(c instanceof JSONTree) {
                    let nodes = c.searchAll(this.search_val, true);
                    nodes.forEach(c => c.mark_color = "rgba(119, 119, 119, 0.3)");

                    this.selection.push({
                        search_val: this.search_val,
                        nodes
                    });
                    console.log(this.selection[this.selection.length - 1]);
                }
            }
        },
        replace() {
            console.log("replace", this.replace_val);
            this.selection.forEach(({ search_val, nodes }) => {
                nodes.forEach(n => {
                    if(n.key === search_val) n.editKey(this.replace_val);
                    else n.edit(this.replace_val);
                    console.log(n.key, n.data, search_val, n);
                });
            });
            TabSystem.setCurrentUnsaved();
            this.reset();
        },

        reset() {
            this.selection.forEach(({ nodes }) => nodes.forEach(n => n.mark_color = undefined));
            this.selection = [];
        }
    }
}
</script>

<style scoped>
    p {
        padding: 0.5em;
    }
</style>
