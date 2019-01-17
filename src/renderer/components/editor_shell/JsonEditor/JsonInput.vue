<template>
    <v-flex v-show="type != 'edit' || value != ''">
        <v-layout>
            <v-combobox
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
    export default {
        name: "json-input",
        props: {
            type: String,
            tab_id: Number
        },
        data() {
            return {
                items: [
                    "minecraft:addrider",
                    "minecraft:attack",
                    "minecraft:ambient_sound_interval",
                    "minecraft:can_climb",
                    "minecraft:can_fly",
                    "minecraft:can_power_jump",
                    "minecraft:collision_box",
                    "minecraft:color",
                    "minecraft:color2"
                ],
                select: "",
                internal_value: ""
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
            value: {
                get() {
                    if(this.type != "edit") {
                        return this.internal_value;
                    } else {
                        return this.$store.getters.current_edit_selected();
                    }
                },
                set(val) {
                    if(this.type != "edit") {
                        this.internal_value = val;
                    } else {
                        this.$store.commit("editTabContentWithPath", {
                            tab_id: this.tab_id,
                            val: val,
                            key: val,
                            prev_key: val
                        });
                    }
                }
            }
        },
        methods: {
            click() {
                console.log(this.value, this.select, this.internal_value);
                
                if(this.value == "") return;
                if(this.type == "object") {
                    this.$store.commit("setTabContentWithPath", {
                        tab_id: this.tab_id,
                        val: [],
                        key: this.value
                    });
                } else if(this.type == "value") {
                    this.$store.commit("setTabContentWithPath", {
                        tab_id: this.tab_id,
                        val: this.value,
                        key: "#&__path-pop__;"
                    });
                }

                this.$nextTick(() => {
                    this.value = "";
                });
            },

            expandPath(path) {
                let current = this.$store.getters.current_internal_file_path();
                this.$store.commit("setCurrentInternalFilePath", `${current}/${path}`);
            }
        }
    }
</script>

<style scoped>
    .v-btn {
        min-width: 0;
    }
</style>
