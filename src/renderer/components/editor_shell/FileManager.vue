<template>
    <span>
        <v-container v-if="extension == 'png'">
            <v-img class="image" :src="image" :style="`max-height: ${available_height}px;`"/>
        </v-container>
        <json-error-screen v-else-if="extension == 'json' && json_object == 'error'"/>
        <json-editor-main v-else-if="extension == 'json'" :compiled="file.is_compiled" :tab_id="tab_id" :object="json_object" :available_height="available_height - 60" :uuid="use_uuid"/>
        <codemirror
            v-else
            v-model="text"
            :options="cm_options"
            ref="cm"
        />
    </span>
</template>

<script>
    import CodeMirror from "codemirror";
    //Language
    import "codemirror/mode/javascript/javascript.js";

    //Style
    import "codemirror/lib/codemirror.css";
    import "codemirror/theme/monokai.css";
    import "codemirror/theme/xq-light.css";
    //import "codemirror/addon/hint/show-hint.css";

    //Other
    import "codemirror/addon/edit/closebrackets.js";
    import "codemirror/addon/comment/comment.js";
    import "codemirror/keymap/sublime.js";
    
    //Files
    import "../../scripts/editor/mcfunction.js";

    import JsonEditorMain from "./JsonEditor/Main";
    import JsonErrorScreen from "./JsonErrorScreen";

    import cJSON from "comment-json";
    import TabSystem from '../../scripts/TabSystem';
    import Runtime from '../../scripts/plugins/Runtime';

    export default {
        name: "file-manager",
        components: {
            JsonEditorMain,
            JsonErrorScreen
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
                alias: {
                    js: "javascript",
                    func: "mcfunction"
                }
            }
        },
        computed: {
            extension() {
                if (this.file) return this.file.file_name.split(".").pop().toLowerCase();
            },
            use_uuid() {
                return `${this.uuid}-${Math.random()})`;
            },

            //FILE CONTENT
            image() {
                if (this.file) {
                    let base64Data = btoa(String.fromCharCode.apply(null, this.file.raw_content));
                    return `data:image/${this.extension};base64,${base64Data}`;
                }
            },
            text: {
                get() {
                    if (this.file) {
                        return this.file.content;
                    }
                    return undefined;
                },
                set(val) {
                    //this.$store.commit("setTabContent", { tab: this.tab_id, content: val });
                    TabSystem.setCurrentContent(val);
                }
            },
            json_object() {
                if(typeof this.text == "string") {
                    try {        
                        return cJSON.parse(this.text, undefined, true);
                    } catch(e) {
                        if(this.text == "") return {};
                        TabSystem.setCurrentInvalid();
                        return  "error";
                    }
                }
                return this.text;
            },

            cm_options() {
                return {
                    lineNumbers: true,
                    line: true,
                    autoCloseBrackets: true,
                    keyMap: "sublime",
                    theme: this.$store.state.Appearance.is_dark_mode ? "monokai" : "xq-light",
                    mode: this.alias[this.extension] || this.extension,
                    styleActiveLine: true,
                    showCursorWhenSelecting: true,
                    lineWrapping: this.$store.state.Settings.line_wraps
                    //extraKeys: { "Ctrl-Space": "autocomplete" },
                };
            } 
        },
        watch: {
            available_height() {
                if(this.$refs.cm) this.$refs.cm.$el.childNodes[1].style.height = this.available_height + "px";
            },
            text() {
                TabSystem.setCurrentUnsaved();
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
    .CodeMirror-vscrollbar {
        outline: none !important;
    }
</style>
<style scoped>
    .image {
        image-rendering: pixelated;
    }
</style>