<template>
        <v-menu
            :color="color"
            :close-on-content-click="false"
            offset-y
            transition="scale-transition"
            bottom
        >   
        <template v-slot:activator="{ on }">
            <div v-on="on" :style="`background: ${color}; border: 2px solid ${outline_color};`" class="color-picker"/>
        </template>
        <v-color-picker
            v-model="color"
            mode="hexa"
            :hide-mode-switch="true"
        />
        </v-menu>
</template>

<script>
    import TabSystem from '../../../scripts/TabSystem';
    import { JSONAction } from "../../../scripts/TabSystem/CommonHistory";

    export default {
        props: {
            node_context: Object
        },
        computed: {
            outline_color() {
                return this.$store.state.Appearance.is_dark_mode ? "white" : "black";
            },
            color: {
                get() {
                    return this.node_context.data;
                },
                set(hex) {
                    TabSystem.getHistory().add(new JSONAction("edit-data", this.node_context, this.node_context.data));
                    TabSystem.setCurrentUnsaved();
                    this.node_context.edit(hex);
                }
            }
        }
    }
</script>

<style>
    .color-picker {
        display: inline-block;
        margin-left: 4px;
        height: 8px;
        width: 8px;
    }
</style>
