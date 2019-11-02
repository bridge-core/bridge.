<template>
    <div>
        <v-container :style="`max-height: ${sidebar_height}px;`">
            <template v-for="(doc, i) in doc_list">
                <v-btn
                    :key="`btn.${i}`"
                    @click.stop="openDoc(doc)"
                    block
                    text
                >
                    <span>{{ doc }}</span>
                    <v-spacer/>
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>

                <v-divider
                    v-if="i + 1 < doc_list.length"
                    :key="`divider.${i}`"
                />
            </template>
        </v-container>
    </div>
</template>

<script>
    import { DOC_LIST, DOC_URL } from '../../../scripts/constants';
    import { shell } from "electron"

    export default {
        name: "content-documentation",
        created() {
            window.addEventListener("resize", this.onResize);
        },
        destroyed() {
            window.removeEventListener("resize", this.onResize);
        },
        data() {
            return {
                sidebar_height: window.innerHeight - 140
            }
        },
        computed: {
            doc_list() {
                return DOC_LIST.sort((a, b) => {
                    return a.toUpperCase().localeCompare(b.toUpperCase());
                });
            }
        },
        methods: {
            onResize() {
                this.sidebar_height = window.innerHeight - 140;
            },

            openDoc(doc) {
                shell.openExternal(`${DOC_URL}${encodeURI(doc)}`);
            }
        }
    }
</script>

<style scoped>
    div.container {
        padding: 4px;
        overflow-y: auto;
    }

    .v-btn {
        margin: 0;
    }
    .first {
        padding-left: 0.1em;
    }
</style>