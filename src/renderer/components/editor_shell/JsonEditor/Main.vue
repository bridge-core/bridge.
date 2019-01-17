<template>
    <span>
        <div v-if="open" :style="element_style">
            <span v-if="render_object.type == 'object' || render_object.type == 'array'">
                <details v-for="(e, i) in render_object.data" :key="`${uuid}-${object_key}/${i}`" :ref="`${object_key}/${e.key}`">
                    <object-key @click.native="click($event, `load(${tab_id}):${object_key}/${e.key}`, e.key)"
                        :my_key="e.key"
                        :comment="e.comment"
                        :object_key="`${object_key}/${e.key}`"
                    ></object-key>

                    <json-editor-main :uuid="uuid" :glob_object="first ? render_object : glob_object" :object="e" :first="false" :tab_id="tab_id" :object_key="`${object_key}/${e.key}`"></json-editor-main>
                </details>
            </span>
            
            <highlight-attribute v-else :class="`key ${key_selected_class}`" @click.stop.native="keyClick" v-ripple>
                {{ render_object.data }}
            </highlight-attribute>
            
        </div>
        <v-divider v-if="first"></v-divider>
        <v-layout @keydown.tab.native="onTab" class="controls" v-if="first">
            <json-input ref="add_object" :tab_id="tab_id" type="object"></json-input>
            <json-input ref="add_value" :tab_id="tab_id" type="value"></json-input>
            <json-input ref="edit" :tab_id="tab_id" type="edit"></json-input>
        </v-layout>
    </span>
</template>

<script>
    import HighlightAttribute from "./HighlightAttribute";
    import ObjectKey from "./ObjectKey";
    import JsonInput from "./JsonInput";
    import InternalJSON from "../../../scripts/editor/Json.js";

    export default {
        name: "json-editor-main",
        components: {
            HighlightAttribute,
            ObjectKey,
            JsonInput
        },
        props: {
            available_height: Number,
            object: [String, Object, Number, Boolean, Array],
            glob_object: [String, Object, Number, Boolean, Array],
            compiled: {
                default: false,
                type: Boolean
            },
            tab_id: Number,
            uuid: String,
            object_key: {
                type: String,
                default: "global"
            },
            first: {
                type: Boolean,
                default: true
            }
        },
        mounted() {
            //console.log("Listening: " + `load(${this.tab_id}):${this.object_key}`);
            this.$root.$on(`load(${this.tab_id}):${this.object_key}`, () => {
                this.open = true;
            });

            if(this.first) {
                this.$root.$on(`commit-json-change`, () => {
                    this.$store.commit("setTabCompiled", this.tab_id);
                    this.$store.commit("setTabContent", { tab: this.tab_id, content: JSON.stringify(this.render_object) });
                });
            }

            if(!this.first && this.render_object.open) {
                this.open = true;
                //console.log(this.$parent.$refs, this.object_key);
                
                this.$parent.$refs[this.object_key][0].open = true;
                this.$root.$emit(`load(${this.tab_id}):${this.object_key}`, true);
            }
        },
        beforeDestroy() {
            this.$root.$off(`load(${this.tab_id}):${this.object_key}`);
            if(this.first) this.$root.$off("commit-json-change");
        },
        data() {
            return {
                
            };
        },
        computed: {
            is_array() {
                return Array.isArray(this.object);
            },
            render_object() {
                if(this.first && !this.compiled) {
                    let obj = InternalJSON.Format.toInternal(this.object);
                    let tree = InternalJSON.Format.toTree(this.object);
                    console.log(tree);
                    // for(let t of tree) {
                    //     console.log(t);
                    // }
                    
                    
                    this.$store.commit("setTabCompiled", this.tab_id);
                    this.$store.commit("setTabContent", { tab: this.tab_id, content: JSON.stringify(obj) });
                    
                    return obj;
                } 
                return this.object;
            },
            element_style() {
                if(this.first) {
                    return `height: ${this.available_height - 40}px; overflow: auto;`
                }   
                return "";
            },
            open: {
                set(val) {
                    this.render_object.open = true;
                    this.$store.commit("setTabContent", { tab: this.tab_id, content: JSON.stringify({ ...this.glob_object, open: val }) });
                }, 
                get() {
                    return this.first || this.render_object.open;
                }
            },

            key_selected_class() {
                return this.is_selected(undefined, "/" + this.render_object.data) ? "selected" : "";
            }
        },
        methods: {
            is_selected(path=this.object_key, expand="") {
                return this.$store.getters.current_internal_file_path() == path + expand;
            },
            click(event, event_to_send, key) {
                let path = `${this.object_key}/${key}`;
                let details = this.$refs[path][0];

                if(details.open && !this.is_selected(path)) {
                    event.preventDefault();
                    //console.log("Send: " + event);
                    
                } else if(!details.open) {
                    this.$root.$emit(event_to_send, true);
                }
                
                this.$store.commit("setCurrentInternalFilePath", path);
            },
            keyClick() {
                let path = `${this.object_key}/${this.render_object.data}`;
                this.$store.commit("setCurrentInternalFilePath", path);
            },
            onTab(ev) {
                ev.preventDefault();
                console.log(ev, this.$refs);
            }
        },
        watch: {
            render_object(new_val, prev_val) {
                if(new_val && prev_val && new_val.open && new_val.open != prev_val.open) {
                    this.$root.$emit(`load(${this.tab_id}:)${this.object_key}`, true);
                    if(this.object_key != "global") this.$parent.$refs[this.object_key][0].open = true;
                }
            }
        }
    }
</script>

<style scoped>
    div, .key {
        margin-left: 0.75em;
    }
    .key {
        cursor: pointer;
    }
    .key.selected {
        font-style: italic;
        background: rgba(255, 255, 255, 0.05);
    }
</style>