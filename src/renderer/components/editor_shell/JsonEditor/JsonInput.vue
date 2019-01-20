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

    export default {
        name: "json-input",
        props: {
            type: String,
            tab_id: Number,
            render_object: Object,
            file_navigation: String
        },
        mounted() {
            if(this.type == "edit") {
                EventBus.on("updateFileNavigation", this.updateValue);
                EventBus.on("updateTabUI", this.updateValue);
                EventBus.on("setWatcherInactive", () => this.watcher_active = false);
            }
        },
        destroyed() {
            if(this.type == "edit") {
                EventBus.off("updateFileNavigation", this.updateValue);
                EventBus.off("updateTabUI", this.updateValue);
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
                }

                this.watcher_active = true;
            }
        },
        data() {
            return {
                items: [
                    // "minecraft:addrider",
                    // "minecraft:attack",
                    // "minecraft:ambient_sound_interval",
                    // "minecraft:can_climb",
                    // "minecraft:can_fly",
                    // "minecraft:can_power_jump",
                    // "minecraft:collision_box",
                    // "minecraft:color",
                    // "minecraft:color2"
                ],
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
            }
        },
        methods: {
            click() {
                if(this.value == "" || !this.value) return;
                let current = this.render_object.get(this.file_navigation);
                
                if(this.type == "object") {
                    current.add(new JSONTree(this.value).openNode()).openNode();
                    current.type = "object";
                    EventBus.trigger("setWatcherInactive");
                    this.expandPath(this.value);
                } else if(this.file_navigation != "global") {
                    current.data += this.value;
                    current.type = typeof this.value;
                    TabSystem.navigationBack();
                }
                TabSystem.setCurrentUnsaved();
                EventBus.trigger("updateCurrentContent");

                this.$nextTick(() => {
                    this.value = "";
                });
            },

            expandPath(path) {
                TabSystem.setCurrentFileNav(`${TabSystem.getCurrentNavigation()}/${path}`);
            },
            updateValue() {
                this.watcher_active = false;
                this.value = TabSystem.getCurrentNavContent();
            }
        }
    }
</script>

<style scoped>
    .v-btn {
        min-width: 0;
    }
</style>
