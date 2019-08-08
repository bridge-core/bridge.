<template>
    <v-dialog
        :eager="true"
        v-model="DOC_WINDOW.is_open"
        :max-width="is_fullscreen ? 2000 : 500"
    >
        <v-card>
            <v-toolbar @dblclick.native="is_fullscreen = !is_fullscreen" height="30px">
                <span class="window-title">Documentation</span>
                <v-spacer></v-spacer>
                <v-btn small icon @click.stop="is_fullscreen = !is_fullscreen">
                    <v-icon small>mdi-plus</v-icon>
                </v-btn>
                <v-btn small icon @click.stop="DOC_WINDOW.close">
                    <v-icon small>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            

            <v-card-text :style="`max-height: ${window_height * 0.75}px; height: ${is_fullscreen ? window_height * 0.75 : 500}px; overflow-y: auto;`">
               <div ref="attach-documentation"></div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import { DOC_LOADER, DOC_WINDOW } from "../../scripts/documentation/main";

    export default {
        name: "documentation-main",
        data() {
            return {
                is_fullscreen: false,
                window_height: window.innerHeight,
                loaded_type: "",
                DOC_WINDOW,
                DOC_LOADER
            }
        },

        created() {
            window.addEventListener("resize", this.onResize);
        },
        mounted() {
            this.updateContent();
            DOC_WINDOW.onOpen = () => this.updateContent();
        },
        destroyed() {
            window.removeEventListener("resize", this.onResize);
        },
        methods: {
            onResize() {
                this.window_height = window.innerHeight;
            },

            updateContent() {
                if(DOC_WINDOW.equals() || this.$refs["attach-documentation"] === undefined) return;
                DOC_WINDOW.update();
                this.$refs["attach-documentation"].innerHTML = DOC_LOADER.get(DOC_WINDOW.get());
            }
        }
    }
</script>

<style scoped>
    .window-title {
        margin-left: 8px;
        cursor: default;
    }
    .v-card__title {
        padding: 0;
    }
    .v-card__actions {
        padding: 0;
    }
</style>