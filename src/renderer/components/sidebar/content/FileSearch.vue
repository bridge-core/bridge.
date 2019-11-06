<template>
    <div>
        <v-toolbar color="expanded_sidebar" flat height="30px">
            <v-tooltip color="tooltip" bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon text @click.stop="" v-on="on" class="toolbar-button" small>
                        <v-icon small>mdi-refresh</v-icon>
                    </v-btn>
                </template>
                <span>Refresh</span>
            </v-tooltip>
        </v-toolbar>
        <v-divider/>

        <v-container>
            <v-text-field
                label="Search"
                append-outer-icon="mdi-magnify"
                solo
                dense
                v-model="search_val"
                @click:append-outer="search"
            />
            <v-text-field
                label="Replace"
                prepend-icon="mdi-chevron-right"
                solo
                dense
                v-model="replace_val"
                @click:prepend="replace"
            />
        </v-container>
    </div>
</template>

<script>
export default {
    name: "content-file-search",
    data() {
        return {
            search_val: "",
            replace_val: ""
        }
    },
    methods: {
        search() {
            console.log("search", this.search_val);
        },
        replace() {
            console.log("replace", this.replace_val);
        }
    }
}
</script>

<style scoped>
    p {
        padding: 0.5em;
    }
</style>
