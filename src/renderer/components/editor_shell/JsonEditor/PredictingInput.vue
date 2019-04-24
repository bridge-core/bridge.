<template>
    <v-flex>
        <v-layout>
            <v-combobox
                ref="input"

                v-model="value"
                @keydown.enter.native="click"
                label="Add"
                :items="items"
                :auto-select-first="true"
                :menu-props="{ maxHeight: 130, top: false }"
                :hide-no-data="true"
                no-data-text="No suggestions available..."
                dense
                class="json-input-menu"
            ></v-combobox>

            <v-btn @click="click(null, 'object')">
                <v-icon>mdi-code-braces</v-icon>
            </v-btn>
            <v-tooltip bottom>
                <v-btn slot="activator" @click="click(null, 'value')">
                    <v-icon>mdi-format-quote-close</v-icon>
                </v-btn>
                <span>Shift + Enter</span>
            </v-tooltip>           
        </v-layout>
    </v-flex>
</template>

<script>
    import TabSystem from '../../../scripts/TabSystem';
    import JSONTree from '../../../scripts/editor/JsonTree';
    import EventBus from '../../../scripts/EventBus'; 
    import PluginEnv from '../../../scripts/plugins/PluginEnv';
    import { JSONAction } from '../../../scripts/TabSystem/CommonHistory';

    export default {
        name: "predicting-json-input",
        props: {
            type: String,
            tab_id: Number,
            render_object: Object,
            file_navigation: String,
            current_file_path: String
        },
        data() {
            return {
                items: [],
                value: "",
                mode: "object"
            };
        },
        mounted() {
            this.updateAutoCompletions();
            EventBus.on("updateAutoCompletions", () => this.updateAutoCompletions());
        },
        destroyed() {
            EventBus.off("updateAutoCompletions", () => this.updateAutoCompletions());
        },
        watch: {
            file_navigation(nav) {
                this.updateAutoCompletions();
            },
            provide_auto_completions(prov_auto) {
                if(!prov_auto) this.items = [];
                else this.updateAutoCompletions();
            }
        },
        computed: {
            provide_auto_completions() {
                return this.$store.state.Settings.auto_completions;
            }
        },
        methods: {
            click(event, force) {
                if(this.value === "" || this.value === undefined || this.value === null) return;

                if(force !== undefined)
                    this.mode = force;
                else if(event !== null && event.shiftKey)
                    this.mode = "value";

                let current = this.render_object.get(this.file_navigation);
                if(this.mode === "object") {
                    let node = new JSONTree(this.value + "");
                    current.add(node, true);
                    current.type = "object";
                    current.openNode();

                    this.expandPath(this.value);
                } else if(this.file_navigation !== "global" && this.mode === "value") {
                    TabSystem.getHistory().add(new JSONAction("edit-data", current, current.data));

                    current.open = true;
                    current.edit(this.value + "");
                    current.type = typeof this.value;
                    this.navigationBack();

                    //PLUGIN HOOK
                    PluginEnv.trigger("bridge:modifiedNode", {
                        node: current
                    });
                }

                TabSystem.setCurrentUnsaved();
                // EventBus.trigger("updateCurrentContent");

                this.$nextTick(() => {
                    this.value = "";
                });            
            },

            updateAutoCompletions() {
                this.mode = "object";

                if(!this.provide_auto_completions) {
                    this.items = [];
                    return;
                }

                
                let current = this.render_object.get(this.file_navigation);
                if(current == undefined || current == null) return;
                let context = Object.keys(current.toJSON());
                    
                let propose = current.propose(this.file_navigation);

                //PLUGIN HOOK
                PluginEnv.trigger("bridge:beforePropose", { propose, node: current });
                if(propose.object !== undefined && propose.object.length > 0)
                    propose = propose.object || [];
                else if(propose.value !== undefined && propose.value.length > 0) {
                    propose = propose.value || [];
                    this.mode = "value";
                } else 
                    return this.items = [];
                
                if(current.data != "")
                    return this.items = [];

                this.items = propose;
                
                this.$nextTick(() => {
                    if(this.items && this.items.length > 0 && this.$refs.input) {
                        if(this.$store.state.Settings.auto_fill_inputs) this.value = this.items[0];
                        if(this.$store.state.Settings.focus_json_inputs) this.$refs.input.focus();
                    }
                });
            },

            expandPath(path) {
                TabSystem.setCurrentFileNav(`${TabSystem.getCurrentNavigation()}/${path}`);
            },
            navigationBack() {
                TabSystem.navigationBack();
                // console.log(this.items.length == 0, this.file_navigation != "global")
                // if(this.items.length == 0 && this.file_navigation != "global") {
                //     TabSystem.navigationBack();
                //     this.updateAutoCompletions()
                //     this.navigationBack();
                // } 
            }
        }
    }
</script>

<style scoped>
    .v-btn {
        min-width: 0;
    }
</style>