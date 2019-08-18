<template>
    <div>
        <v-container :style="`max-height: ${sidebar_height}px;`">
            <v-progress-linear
                :color="show_loading ? 'warning' : 'success'"
                :value="DOC_LOADER.progress"
                :indeterminate="DOC_WINDOW.loading"
            />

            <div v-if="DOC_LOADER.finished_loading">
                <template v-for="(doc, i) in doc_list">
                    <v-btn
                        :key="`btn.${i}`"
                        @click.stop="() => DOC_WINDOW.open(doc)"
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
            </div>
        </v-container>
    </div>
</template>

<script>
    import { DOC_LOADER, DOC_WINDOW } from "../../../scripts/documentation/main";
    import { DOC_LIST } from '../../../scripts/constants';

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
                sidebar_height: window.innerHeight - 140,
                DOC_LOADER,
                DOC_WINDOW
            }
        },
        computed: {
            doc_list() {
                return DOC_LIST.sort((a, b) => {
                    return a.toUpperCase().localeCompare(b.toUpperCase());
                });
            },

            show_loading() {
                return !DOC_LOADER.finished_loading || DOC_WINDOW.loading;
            }
        },
        methods: {
            onResize() {
                this.sidebar_height = window.innerHeight - 140;
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