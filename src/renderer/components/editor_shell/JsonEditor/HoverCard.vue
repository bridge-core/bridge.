<template>
    <v-menu
        v-model="is_visible"
        :close-on-content-click="false"
        :position-x="x_position"
        :position-y="y_position"
    >
        <v-card>
            <v-card-text>
                <pre>{{ data.slice(0, 200) + (data.length > 200 ? "..." : "") }}</pre>
                
            </v-card-text>
            <v-divider/>
                <v-text-field
                    solo
                    v-model="current_comment"
                    @input="updateComment"
                    label="Click to add a comment"
                    prepend-inner-icon="mdi-pencil"
                    hide-details
                    style="margin: 4px 0px;"
                />
            <v-divider/>

            <v-card-actions>
                <v-spacer/>
                <v-tooltip
                    v-for="(btn, i) in buttons"
                    :key="i"
                    bottom
                    :color="btn.color || 'primary'"
                    :style="`margin-right: ${ i + 1 !== buttons.length ? 4 : 0}px;`"
                >
                    <v-btn
                        slot="activator"
                        :color="btn.color || 'primary'" 
                        round
                        icon
                        @click="btn.action"
                    >
                        <v-icon>{{ btn.icon }}</v-icon>
                    </v-btn>
                    <span>{{ btn.title }}</span>
                </v-tooltip>
                
            </v-card-actions>
        </v-card>
    </v-menu>
</template>

<script>
import TabSystem from "../../../scripts/TabSystem";
import { clipboard } from "electron";
import { JSONAction } from "../../../scripts/TabSystem/CommonHistory";
import EventBus from '../../../scripts/EventBus';

export default {
    name: "json-editor-hover-card",
    mounted() {
        EventBus.on("updateFileNavigation", this.updateCurrentComment);
    },
    destroyed() {
        EventBus.off("updateFileNavigation", this.updateCurrentComment);
    },
    data() {
        return {
            current_comment: "",
            buttons: [
                {
                    title: "Move Down",
                    icon: "mdi-chevron-down",
                    action: () => TabSystem.moveCurrentDown()
                },
                {
                    title: "Move Up",
                    icon: "mdi-chevron-up",
                    action: () => TabSystem.moveCurrentUp()
                },
                {
                    title: "Copy",
                    icon: "mdi-content-copy",
                    color: "success",
                    action: () => {
                        let node = TabSystem.getCurrentNavObj();
                        let obj = { [node.key]: node.toJSON() };
                        clipboard.writeText(JSON.stringify(obj, null, "\t"));
                    }
                },
                {
                    title: "Cut",
                    icon: "mdi-content-cut",
                    color: "success",
                    action: () => {
                        this.is_visible = false;

                        let node = TabSystem.getCurrentNavObj();
                        //HISTORY
                        TabSystem.getHistory().add(new JSONAction("add", node.parent, node));

                        let obj = { [node.key]: node.toJSON() };
                        clipboard.writeText(JSON.stringify(obj, null, "\t"));
                        TabSystem.deleteCurrent();
                        TabSystem.setCurrentFileNav("global");
                        TabSystem.setCurrentUnsaved();
                    }
                },
                {
                    title: "Paste",
                    icon: "mdi-download",
                    color: "success",
                    action: () => TabSystem.getCurrentNavObj().buildFromObject(JSON.parse(clipboard.readText()), undefined, true)
                },
                {
                    title: "Delete",
                    icon: "mdi-delete",
                    color: "error",
                    action: () => {
                        this.is_visible = false;
                        TabSystem.deleteCurrent();
                    }
                }
            ]
        }
    },
    computed: {
        data() {
            return this.$store.state.EditorHover.data;
        },
        is_visible: {
            get() {
                return this.$store.state.EditorHover.is_visible;
            },
            set() {
                this.$store.commit("hideEditorHoverCard");
            }
        },
        x_position() {
            return this.$store.state.EditorHover.x_position;
        },
        y_position() {
            return this.$store.state.EditorHover.y_position;
        }
    },
    methods: {
        updateComment(val) {
            TabSystem.getCurrentNavObj().comment = val;
        },
        updateCurrentComment() {
            try { this.current_comment = TabSystem.getCurrentNavObj().comment; } catch(e) {  }
        }
    }
}
</script>

<style scoped>
    pre {
        font-family: 'Roboto', sans-serif !important;
    }
</style>
