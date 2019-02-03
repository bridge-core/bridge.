<template>
    <v-flex v-show="type != 'edit' || file_navigation != 'global'">
        <v-layout>
            <v-text-field
                ref="input"

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
                :hide-no-data="true"
                dense
            ></v-combobox>
            <v-btn v-if="type != 'edit'" @click="click">
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

    export default {
        name: "json-input",
        props: {
            type: String,
            tab_id: Number,
            render_object: Object,
            file_navigation: String,
            current_file_path: String
        },
        created() {
            if(this.type != "edit") {
                this.updateAutoCompletions();
            } 
        },
        mounted() {
            if(this.type == "edit") {
                EventBus.on("updateFileNavigation", this.updateValue);
                EventBus.on("updateSelectedTab", this.updateValue);
                EventBus.on("setWatcherInactive", () => this.watcher_active = false);
            }
        },
        destroyed() {
            if(this.type == "edit") {
                EventBus.off("updateFileNavigation", this.updateValue);
                EventBus.off("updateSelectedTab", this.updateValue);
            } 
        },
        watch: {
            value(val) {
                if(this.type == "edit" && this.watcher_active) {
                    let tmp = this.file_navigation.split("/");
                    tmp.pop();

                    TabSystem.setCurrentNavContent(val);
                    tmp.push(val);
                    
                    TabSystem.setCurrentFileNav(tmp.join("/"));
                    TabSystem.setCurrentUnsaved();

                    //PLUGIN HOOK
                    PluginEnv.trigger("bridge:modifiedNode", {
                        node: TabSystem.getSelected().content.get(this.file_navigation)
                    });
                }

                this.watcher_active = true;
            },
            file_navigation(nav) {
                if(this.type == "edit") return;
                this.updateAutoCompletions();
            },
            provide_auto_completions(prov_auto) {
                if(!prov_auto) this.items = [];
                else this.updateAutoCompletions();
            }
        },
        data() {
            return {
                items: [],
                select: "",
                value: "",
                watcher_active: true
            };
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
                
                if(this.type == "object") {
                    let node = new JSONTree(this.value + "").openNode();
                    current.add(node).openNode();
                    current.type = "object";
                    EventBus.trigger("setWatcherInactive");

                    this.expandPath(this.value);
                } else if(this.file_navigation != "global") {
                    current.data += this.value + "";
                    current.type = typeof this.value;
                    this.updateAutoCompletions();
                    this.navigationBack();

                    //PLUGIN HOOK
                    PluginEnv.trigger("bridge:modifiedNode", {
                        node: current
                    });
                }
                TabSystem.setCurrentUnsaved();
                EventBus.trigger("updateCurrentContent");

                this.$nextTick(() => {
                    this.value = "";
                });
            },

            updateAutoCompletions() {
                if(!this.provide_auto_completions) {
                    this.items = [];
                    return;
                }

                let context = [];
                let current = this.render_object.get(this.file_navigation);
                if(current == undefined) return;
                if(this.type == "object")
                    context = Object.keys(current.toJSON());
                if(this.type == "value") {
                    if(current) context = current.data;
                    else context = [];
                }
                    

                let current_node = TabSystem.getSelected().content.get(this.file_navigation);
                let propose;
                if(current_node) propose = current_node.propose(this.file_navigation);
                else propose = [];

                //PLUGIN HOOK
                PluginEnv.trigger("bridge:beforePropose", { propose, node: current_node });
                propose = propose[this.type];
                
                if(propose == undefined || propose.length == 0 || (typeof context == "string" && context != ""))
                    return this.items = [];

                this.items = propose.filter(e => !context.includes(e));

                // CURRENTLY MAKES IT IMPOSSIBLE TO SELECT A NODE WHICH IS CONSIDERED "FILLED"
                // if(this.items.length == 0) {
                //     this.navigationBack();
                // }

                if(this.items && this.items.length > 0 && this.$refs.input)
                    this.$refs.input.focus();
            },

            expandPath(path) {
                TabSystem.setCurrentFileNav(`${TabSystem.getCurrentNavigation()}/${path}`);
            },
            updateValue() {
                //FIXME: DOESN'T UPDATE AFTER SWITCHING TABS
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
