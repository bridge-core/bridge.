<template>
    <span>
        <div v-if="open" :style="element_style">
            <span v-if="render_object.type == 'object' || render_object.type == 'array'">
                <details 
                    v-for="(e, i) in render_object.children"
                    :key="`${uuid}.${e.open}.${object_key}/${i}.${Math.random()}`"
                    :ref="`${object_key}/${(e.key + '').replace(/\//g, '#;slash;#')}`"
                >
                    <object-key 
                        @contextmenu.native="openContextMenu"
                        @click.native="click($event, `load(${tab_id}):${object_key}/${e.key}`, e.key)"
                        :my_key="e.key"
                        :comment="e.comment"
                        :object_key="`${object_key}/${(e.key + '').replace(/\//g, '#;slash;#')}`"
                        :mark="e.mark_color"
                    />

                    <json-editor-main 
                        :uuid="uuid"
                        :glob_object="first ? render_object : glob_object"
                        :object="e"
                        :first="false"
                        :tab_id="tab_id"
                        :object_key="`${object_key}/${(e.key + '').replace(/\//g, '#;slash;#')}`"
                    />
                </details>
            </span>
            
            <highlight-attribute 
                v-else
                :class="`key ${key_selected_class}`"
                :data="value_data"
                @contextmenu.native="openContextMenu"
                @click.stop.native="keyClick"
                v-ripple
            />
        </div>
        <v-divider v-if="first"></v-divider>
        <v-layout class="controls" v-if="first">
            <json-input
                v-for="e in ['object', 'value', 'edit']"
                :ref="e"
                :render_object="render_object"
                :tab_id="tab_id"
                :type="e"
                :key="`${e}`"
                :file_navigation="file_navigation"
                :current_file_path="current_file_path"
            />
        </v-layout>
    </span>
</template>

<script>
    import HighlightAttribute from "./HighlightAttribute";
    import ObjectKey from "./ObjectKey";
    import JsonInput from "./JsonInput";
    import InternalJSON from "../../../scripts/editor/Json.js";
    import TabSystem from '../../../scripts/TabSystem';
    import EventBus from '../../../scripts/EventBus';

    export default {
        name: "json-editor-main",
        components: {
            HighlightAttribute,
            ObjectKey,
            JsonInput
        },
        props: {
            available_height: Number,
            current_file_path: String,
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
                EventBus.on("updateFileNavigation", () => {
                    this.file_navigation = TabSystem.getCurrentNavigation();
                });
                EventBus.on("updateCurrentContent", (new_o=this.computed_object()) => {
                    this.render_object = new_o;
                });

                if(this.$store.state.Settings.open_all_nodes) 
                    this.$nextTick(() => this.openAllChildren());
                else
                    this.$store.commit("removeLoadingWindow", { id: "open-file" });
            }

            if(!this.first && this.render_object.open) {
                this.open = true;

                this.$parent.$refs[this.object_key][0].open = true;
                this.$root.$emit(`load(${this.tab_id}):${this.object_key}`, true);
            }            
        },
        beforeDestroy() {
            this.$root.$off(`load(${this.tab_id}):${this.object_key}`);
            if(this.first) {
                EventBus.off("updateFileNavigation");
                EventBus.off("updateCurrentContent");
            }
        },
        data() {
            return {
                file_navigation: TabSystem.getCurrentNavigation(),
                render_object: this.computed_object()
            };
        },
        computed: {
            element_style() {
                if(this.first) {
                    return `height: ${this.available_height - 40}px; overflow: auto;`
                }   
                return "";
            },
            open: {
                set(val) {
                    this.render_object.open = val;
                }, 
                get() {
                    return this.first || this.render_object.open;
                }
            },

            evaluated_key() {
                if(typeof this.render_object.data != "string") return this.render_object.data;
                return (this.render_object.data + "").replace(/\//g, "#;slash;#");
            },

            key_selected_class() {
                return this.is_selected(undefined, "/" + this.evaluated_key) ? "selected" : "";
            },
            value_data() {
                return this.render_object.data;
            }
        },
        methods: {
            computed_object() {
                if(this.first && !this.compiled) {
                    let tree = InternalJSON.Format.toTree(this.object);

                    TabSystem.setTabCompiled(true);
                    TabSystem.setCurrentContent(tree);
                    this.$nextTick(() => {
                        TabSystem.setCurrentSaved();
                    });
                    
                    return tree;
                }
                return this.object;
            },
            is_selected(path=this.object_key, expand="") {
                return TabSystem.getCurrentNavigation() == path + expand;
            },
            click(event, event_to_send, key) {
                let path = `${this.object_key}/${key.replace(/\//g, "#;slash;#")}`;
                let details = this.$refs[path][0];
                
                if(details.open && !this.is_selected(path)) {
                    event.preventDefault();
                } else if(!details.open) {
                    this.render_object.get(key).open = true;
                } else {
                    this.render_object.get(key).open = false;
                }

                TabSystem.setCurrentFileNav(path);
            },
            keyClick() {
                let path = `${this.object_key}/${(this.render_object.data + "").replace(/\//g, "#;slash;#")}`;
                TabSystem.setCurrentFileNav(path);
            },
            openAllChildren(children=this.computed_object().children, first=true, depth=0, deepest=this.computed_object().depth) {
                window.setTimeout(() => {
                    this.open = true;
                    children.forEach(c => this.openAllChildren(c.openNode().children, false, depth + 1, deepest));

                    if(depth == deepest) this.$store.commit("removeLoadingWindow", { id: "open-file" });
                }, 5);
            },
            openContextMenu(event) {
                this.$store.commit("openContextMenu", {
                    active_state: "node",
                    x_position: event.clientX,
                    y_position: event.clientY
                });
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