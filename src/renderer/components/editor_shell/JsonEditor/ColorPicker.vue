<template>
    <span>
        <div
            @click="openWindow"
            :style="`background: ${color}; border: 2px solid ${outline_color};`"
            class="color-picker"
        />
    </span>
</template>

<script>
    import TabSystem from '../../../scripts/TabSystem';
    import { JSONAction } from "../../../scripts/TabSystem/CommonHistory";
    import ColorPicker from "../../../windows/ColorPicker";

    export default {
        props: {
            node_context: Object,
            is_immutable: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                is_visible: false
            }
        },
        computed: {
            outline_color() {
                return this.$store.state.Appearance.is_dark_mode ? "white" : "black";
            },
            color() {
                return this.node_context.data;
            }
        },
        methods: {
            openWindow() {
                if(this.is_immutable) return;
                new ColorPicker(this.node_context.data, (val) => {
                    if(val === this.node_context.data) return;
                    TabSystem.getHistory().add(new JSONAction("edit-data", this.node_context, this.node_context.data));
                    TabSystem.setCurrentUnsaved();
                    this.node_context.edit(val);
                });
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
<style scoped>
    div.color-picker-container {
        width: 30px;
        height: 30px;
        display: inline-block;
        background-color: #EEE;
        position: relative;
        top: 19px;
        outline: 3px solid #C9C9C9;
    }
</style>