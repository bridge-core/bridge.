<template>
    <v-flex v-show="type != 'edit' || file_navigation != 'global'">
        <v-layout>
            <v-text-field
                ref="input"
                @keydown.enter.native="click"
                v-if="type == 'edit'"
                v-model="value"
            />
            <v-combobox
                ref="input"

                v-else
                v-model="value"
                @keydown.enter.native="click"
                :label="label"
                :items="items"
                :auto-select-first="true"
                :menu-props="{ maxHeight: 130, top: false }"
                :hide-no-data="true"
                no-data-text="No suggestions available..."
                dense
                class="json-input-menu"
            ></v-combobox>
            <v-btn @click="click">
                +
            </v-btn>
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
        name: "json-input",
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
                value: ""
            };
        },
        mounted() {
            if(this.type == "edit") {
                this.value = TabSystem.getCurrentNavContent();
                EventBus.on("updateFileNavigation", this.updateValue);
                EventBus.on("setWatcherInactive", () => this.watcher_active = false);
            } else {
                this.updateAutoCompletions();
                EventBus.on("updateAutoCompletions", () => this.updateAutoCompletions());
            }
        },
        destroyed() {
            if(this.type == "edit") {
                EventBus.off("updateFileNavigation", this.updateValue);
            } else {
                EventBus.off("updateAutoCompletions", () => this.updateAutoCompletions());
            }
        },
        watch: {
            file_navigation(nav) {
                if(this.type == "edit") return;
                this.updateAutoCompletions();
            },
            provide_auto_completions(prov_auto) {
                if(!prov_auto) this.items = [];
                else this.updateAutoCompletions();
            }
        },
        computed: {
            label() {
                if(this.type == "object") {
                    return "Add object";
                } else if(this.type == "value") {
                    return "Add value";
                } else {
                    return "Edit";
                }
            },
            provide_auto_completions() {
                return this.$store.state.Settings.auto_completions;
            }
        },
        methods: {
            click() {
                // console.log(this.value, this.render_object.get(this.file_navigation));
                if(this.value == "" || !this.value) return;
                let current = this.render_object.get(this.file_navigation);
                let is_data_path = TabSystem.getSelected().content.isDataPath(this.file_navigation);
                if(this.type === "object") {
                    let node = new JSONTree(this.value + "");
                    current.add(node, true).openNode();
                    current.type = "object";
                    EventBus.trigger("setWatcherInactive");

                    this.expandPath(this.value);
                } else if(this.file_navigation !== "global" && this.type === "value") {
                    TabSystem.getHistory().add(new JSONAction("edit-data", current, current.data));
                    current.edit(this.value);;
                    current.type = typeof this.value;
                    this.navigationBack();

                    //PLUGIN HOOK
                    PluginEnv.trigger("bridge:modifiedNode", {
                        node: current
                    });
                } else if(this.type === "edit") {
                    if(!is_data_path) {
                        TabSystem.getHistory().add(new JSONAction("edit-key", current, current.key));
                        current.key = this.value;
                        current.updateUUID();
                        TabSystem.setCurrentFileNav(current.path);
                    } 
                    else {
                        TabSystem.getHistory().add(new JSONAction("edit-data", current, current.data));
                        current.edit(this.value);
                        TabSystem.setCurrentFileNav(current.path + "/" +  this.value);
                    }

                    //PLUGIN HOOK
                    PluginEnv.trigger("bridge:modifiedNode", {
                        node: current
                    });
                }
                TabSystem.setCurrentUnsaved();
                EventBus.trigger("updateCurrentContent");

                if(this.type !== "edit") {
                    this.$nextTick(() => {
                        this.value = "";
                    });
                }               
            },

            updateAutoCompletions() {
                if(!this.provide_auto_completions) {
                    this.items = [];
                    return;
                }

                let current = this.render_object.get(this.file_navigation);
                if(current === undefined || current === null) return;
                if(this.type == "value" && current.data !== "") {
                    this.items = [];
                    return;
                }

                //PLUGIN HOOK
                let propose = current.propose(this.file_navigation);
                PluginEnv.trigger("bridge:beforePropose", { propose, node: current });
                this.items = propose[this.type];

                
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
            updateValue() {
                this.watcher_active = false;
                this.value = TabSystem.getCurrentNavContent();    
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

<style>
    .v-menu__content.v-autocomplete__content .v-list__tile:not(.v-list__tile--avatar) {
        height: 26px !important;
    }
</style>
