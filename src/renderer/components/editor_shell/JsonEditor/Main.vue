<template>
    <span class="px14-font">
        <div v-if="open" :style="element_style">
            <span v-if="render_object.type == 'object' || render_object.type == 'array'">
                <draggable 
                    v-model="render_object.children"
                    v-bind="{ group: 'key', disabled: disabled_dragging }"
                    @change="draggedKey"
                >
                    <details 
                        v-for="e in render_object.children"
                        :key="e.uuid"
                        :ref="`${object_key}/${(e.key + '').replace(/\//g, '#;slash;#')}`"
                        :open="e.open"
                    >
                        <object-key 
                            @mainClick="click($event, e.parsed_key)"
                            @arrowClick="$event.ctrlKey ? e.toggleOpenDeep() : e.toggleOpen()"
                            :object="e"
                            :my_key="e.key"
                            :comment="e.comment"
                            :object_key="`${object_key}/${(e.key + '').replace(/\//g, '#;slash;#')}`"
                            :mark="e.mark_color"
                            :error="e.error"
                            :child_contains_error="e.child_contains_error"
                            :node_context="e"
                            :is_immutable="is_immutable"
                        />

                        <json-editor-main 
                            :glob_object="first ? render_object : glob_object"
                            :object="e"
                            :first="false"
                            :tab_id="tab_id"
                            :object_key="`${object_key}/${(e.key + '').replace(/\//g, '#;slash;#')}`"
                            :is_immutable="is_immutable"
                        />
                    </details>
                </draggable>
            </span>
            
            <highlight-attribute 
                v-else
                :class="`key ${key_selected_class}`"
                :data="value_data"
                :meta="render_object.meta"
                :node_context="render_object"
                @click="attrClick"
            />
        </div>
        <v-divider v-if="first && !is_immutable"></v-divider>
        <v-layout class="controls" v-if="first && !is_immutable">
            <template v-if="$store.state.Settings.bridge_predictions && isKnownFileType()">
                <predicting-input
                    :render_object="render_object"
                    :tab_id="tab_id"
                    :file_navigation="file_navigation"
                    :current_file_path="current_file_path"
                />
                <json-input
                    ref="edit"
                    :render_object="render_object"
                    :tab_id="tab_id"
                    type="edit"
                    :file_navigation="file_navigation"
                    :current_file_path="current_file_path"
                />
            </template>
            <template v-else>
                <json-input
                    v-for="input_type in ['object', 'value', 'edit']"
                    :ref="input_type"
                    :render_object="render_object"
                    :tab_id="tab_id"
                    :type="input_type"
                    :key="`${input_type}`"
                    :file_navigation="file_navigation"
                    :current_file_path="current_file_path"
                />
            </template>
        </v-layout>
    </span>
</template>

<script>
    import HighlightAttribute from "./HighlightAttribute";
    import ObjectKey from "./ObjectKey";
    import JsonInput from "./JsonInput";
    import PredictingInput from "./PredictingInput";
    import InternalJSON from "../../../scripts/editor/Json.js";
    import TabSystem from '../../../scripts/TabSystem';
    import EventBus from '../../../scripts/EventBus';
    import JSONTree from '../../../scripts/editor/JsonTree';
    import FileType from '../../../scripts/editor/FileType';
    import draggable from "vuedraggable";

    export default {
        name: "json-editor-main",
        components: {
            HighlightAttribute,
            ObjectKey,
            JsonInput,
            PredictingInput,
            draggable
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
            object_key: {
                type: String,
                default: "global"
            },
            is_immutable: {
                type: Boolean,
                default: false
            },
            first: {
                type: Boolean,
                default: true
            }
        },
        mounted() {
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
        },
        beforeDestroy() {
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
                    return `height: ${this.available_height - 170 * !this.is_immutable}px; overflow: auto;`
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
            },
            disabled_dragging() {
                return this.$store.state.Settings.disable_node_dragging || this.is_immutable;
            }
        },
        methods: {
            computed_object() {
                if(this.first && !this.compiled) {
                    let tree = InternalJSON.Format.toTree(this.object);

                    TabSystem.setTabCompiled(true);
                    TabSystem.setCurrentContent(tree);

                    return tree;
                }
                return this.object;
            },
            is_selected(path=this.object_key, expand="") {
                return TabSystem.getCurrentNavigation() == path + expand;
            },
            click(event, key) {
                if(event.target.tagName === "I" || event.target.tagName === "BUTTON")
                    return;
                event.preventDefault();
                let context = this.object.get(key);

                if(!this.$store.state.Settings.cade_node_click && !event.ctrlKey) {              
                    if(context.open && !this.is_selected(context.path)) {
                        //CANNOT BE EARLY RETURN; PATH NEEDS TO BE SET FURTHER BELOW
                    } else if(!context.open) {
                        context.openNode(true);
                    } else {
                        context.openNode(false);
                    }
                } else if(event.ctrlKey) {
                    context.toggleOpenDeep();
                }
                
                TabSystem.setCurrentFileNav(context.path);
            },
            attrClick() {
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
            draggedKey(data) {
                TabSystem.setCurrentUnsaved();

                if("added" in data) {
                    let c = data.added.element;
                    let update_path = false;
                    if(TabSystem.getCurrentNavigation() === c.path) update_path = true;
                    c.parent = this.object;
                    if(update_path) TabSystem.setCurrentFileNav(c.path);
                }               
            },

            isKnownFileType() {
                return FileType.get() !== "unknown";
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
        background: rgba(119, 119, 119, 0.1);
    }
</style>