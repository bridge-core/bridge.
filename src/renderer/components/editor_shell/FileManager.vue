<template>
    <span>
        <v-container v-if="extension == 'png'">
            <v-img class="image" :src="image" :style="`max-height: ${available_height}px;`"/>
        </v-container>
        <json-editor-main v-else-if="extension == 'json'" :compiled="file.compiled" :tab_id="tab_id" :object="json_object" :available_height="available_height - 60" :uuid="use_uuid"></json-editor-main>
        <codemirror
            v-else-if="extension == 'json' || extension == 'js'"
            v-model="text"
            :options="cm_options"
            ref="cm"
        />
        <quill-editor 
            v-else
            :content="text"
            :tab_id="tab_id"
            :height="available_height"
            :extension="extension"
        >
        </quill-editor>
    </span>
</template>

<script>
    //Language
    import "codemirror/mode/javascript/javascript.js";

    //Selection
    import "codemirror/addon/selection/mark-selection.js";
    import "codemirror/addon/selection/active-line.js";
    //Style
    import "codemirror/lib/codemirror.css";
    import "codemirror/theme/monokai.css";
    import "codemirror/theme/xq-light.css";
    //import "codemirror/addon/hint/show-hint.css";

    //Other
    import "codemirror/addon/edit/closebrackets.js";
    //import "codemirror/addon/hint/show-hint.js";
    //import "codemirror/addon/hint/javascript-hint.js";

    import QuillEditor from "./QuillEditor";
    import JsonEditorMain from "./JsonEditor/Main";

    import safeEval from "safe-eval";

    export default {
        name: "file-manager",
        components: {
            QuillEditor,
            JsonEditorMain
        },
        props: {
            file: Object,
            available_height: Number,
            tab_id: Number, 
            uuid: String
        },
        mounted() {
            if(this.$refs.cm) {
                this.$refs.cm.$el.childNodes[1].style.height = this.available_height + "px";
            } 
        },
        data() {
            return {
                
            }
        },
        computed: {
            extension() {
                if (this.file) return this.file.file.split(".").pop().toLowerCase();
            },
            use_uuid() {
                return `${this.uuid}-${Math.random()})`;
            },

            //FILE CONTENT
            image() {
                if (this.file) {
                    let base64Data = btoa(String.fromCharCode.apply(null, this.file.content));
                    return `data:image/${this.extension};base64,${base64Data}`;
                }
            },
            text: {
                get() {
                    if (this.file) {
                        try {
                            return new TextDecoder('utf-8').decode(this.file.content);
                        } catch(err) {
                            return this.file.content;
                        } 
                    }
                    return undefined;
                },
                set(val) {
                    this.$store.commit("setTabContent", { tab: this.tab_id, content: val });
                }
            },
            json_object() {
                try {
                    return safeEval(this.text);
                } catch(e) {
                    return this.text == "" ? { } : "";
                }
            },

            cm_options() {
                return {
                    lineNumbers: true,
                    line: true,
                    autoCloseBrackets: true,
                    theme: this.$store.state.Appearance.is_dark_mode ? "monokai" : "xq-light",
                    mode: "text/javascript",
                    //extraKeys: { "Ctrl-Space": "autocomplete" },
                };
            } 
        },
        watch: {
            available_height() {
                if(this.$refs.cm) this.$refs.cm.$el.childNodes[1].style.height = this.available_height + "px";
            }
        }
    }
</script>

<style>
    .CodeMirror.cm-s-monokai > * {
        background: #303030;
    }
    .cm-s-monokai .CodeMirror-gutter, .cm-s-monokai .CodeMirror-linenumbers {
        background: rgb(60, 60, 60);
    }
    .cm-s-monokai .CodeMirror-selected {
        background: rgb(60, 60, 60) !important;
    }
</style>
<style scoped>
    .image {
        image-rendering: pixelated;
    }
</style>