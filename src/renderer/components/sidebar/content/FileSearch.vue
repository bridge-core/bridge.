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
            />
            <v-divider/>
        </v-container>
    </div>
</template>

<script>
import TabSystem from '../../../scripts/TabSystem';
import JSONTree from '../../../scripts/editor/JsonTree';

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
    methods: {
        search() {
            if(this.search_all) {

            } else {
                let sel = TabSystem.getSelected();
                if(!sel) return;

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
        },

        reset() {
            console.log(this.selection)
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
