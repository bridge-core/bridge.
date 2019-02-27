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

            <v-card-actions>
                <v-spacer/>
                <v-tooltip
                    v-for="(btn, i) in buttons"
                    :key="i"
                    bottom
                    :color="btn.color || 'success'"
                    style="margin-right: 4px;"
                >
                    <v-btn
                        slot="activator"
                        :color="btn.color || 'success'" 
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

export default {
    name: "json-editor-hover-card",
    data() {
        return {
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
                    title: "Cut",
                    icon: "mdi-content-cut",
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
                    title: "Copy",
                    icon: "mdi-content-copy",
                    action: () => {
                        let node = TabSystem.getCurrentNavObj();
                        let obj = { [node.key]: node.toJSON() };
                        clipboard.writeText(JSON.stringify(obj, null, "\t"));
                    }
                },
                {
                    title: "Paste",
                    icon: "mdi-download",
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
    }
}
</script>