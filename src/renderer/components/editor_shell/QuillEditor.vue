<template>
<div>
    <div 
        :class="this.$store.state.Appearance.is_dark_mode ? 'dark' : 'light'"
        :id="`quill-editor-${random_id}-${tab_id}`"
        :style="`height: ${height + 37}px;`"
    >
        
    </div>
    <v-divider></v-divider>
</div>
</template>

<script>
    import hljs from "../../scripts/editor/hljs";
    import Quill from "quill";
    
    import "highlight.js/styles/monokai-sublime.css";
    import "quill/dist/quill.core.css";
    import "quill/dist/quill.snow.css";
    import "quill/dist/quill.bubble.css";

    export default {
        name: "quill-editor",
        props: {
            content: String,
            extension: String,
            tab_id: Number,
            height: Number
        },
        data() {
            return {
                last_shall_update: true,
                random_id: Math.random()
            };
        },
        mounted() {
            this.editor = new Quill(document.getElementById(`quill-editor-${this.random_id}-${this.tab_id}`), {
                modules: {
                    history: {
                        delay: 2000,
                        maxStack: 500,
                        userOnly: true
                    },
                    syntax: {
                        //highlight: text => hljs.highlightAuto(text).value
                        highlight: (text) => {
                            if(hljs.getLanguage(this.extension) != undefined) {
                                return hljs.highlight(this.extension, text, true).value;
                            }
                            return text;
                        }
                    },
                    toolbar: false
                }
            });
            this.editor.on('text-change', (delta, old_delta, source) => {
                if(source == "user") {
                    this.$store.commit("setTabContent", { tab: this.tab_id, content: this.editor.getText() })
                }
            });

            this.setContent();
        },
        methods: {
            setContent() {
                let ops = [
                    {
                        insert: this.content,
                        attributes: {
                            "code-block": true
                        }
                    }
                ];

                if(!this.content.endsWith("\n")) {                 
                    ops.push({
                        insert: "\n",
                        attributes: {
                            "code-block": true
                        }
                    });
                }

                this.editor.setContents({
                    ops
                }, "api");
            }
        }
    }
</script>

<style scoped>
    .dark {
        --hljs-standard-color: #FAFAFA;
    }
    .light {
        --hljs-standard-color: #212121;
    }
</style>

<style>
    .ql-container {
        border: none !important;
        overflow: auto;
    }
    .ql-editor {
        padding: 0;
    }
    .ql-syntax {
        margin: 0 !important;
    }

    .hljs-invalid {
        color: #FF1744;
        font-style: italic;
    }
    .hljs-standard {
        color: var(--hljs-standard-color);
    }
</style>