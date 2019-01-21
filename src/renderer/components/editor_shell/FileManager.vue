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
    import "codemirror/addon/mode/simple.js";
    import CodeMirror from "codemirror";
    //import "codemirror/addon/hint/show-hint.js";
    //import "codemirror/addon/hint/javascript-hint.js";

    import JsonEditorMain from "./JsonEditor/Main";
    import JsonErrorScreen from "./JsonErrorScreen";

    import cJSON from "comment-json";
    import TabSystem from '../../scripts/TabSystem';

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
            CodeMirror.defineSimpleMode("mcfunction", {
                start: [
                    {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
                    {regex: /(?:execute|effect|summon|setblock|fill|scoreboard|detect|testforblock|testforblocks|say|tellraw|kill|setworldspawn|spawnpoint|gamemode|tp|teleport|replaceitem|clear|enchant|give|weather|xp|clone|title|stopsound|playsound|tag|help)\b/, token: "keyword"},
                    // {regex: /(?:type|l|lm|r|rm|x|dx|y|dy|z|dz|rx|ry|scores|tag|name)\b/, token: "property"},
                    {regex: /(?:@a|@e|@s|@r|@p)\b/, token: "variable-3"},
                    {regex: /true|false/, token: "atom"},
                    {regex: /(?:=|=\!|\,)\b/, token: "def"},
                    {regex: /[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
                    {regex: /#.*/, token: "comment"},

                    {regex: /(?:~|\^)\b/, token: "operator"}
                ],
                meta: {
                    lineComment: "#"
                }
            });
        },
        data() {
            return {
                alias: {
                    js: "javascript"
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
                        return this.text == "" ? { } : "error";
                    }
                }
                return this.text;
            },

            cm_options() {
                return {
                    lineNumbers: true,
                    line: true,
                    autoCloseBrackets: true,
                    theme: this.$store.state.Appearance.is_dark_mode ? "monokai" : "xq-light",
                    mode: this.alias[this.extension] || this.extension,
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