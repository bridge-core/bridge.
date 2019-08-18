<template>
    <v-dialog
        v-model="is_window_visible"
        scrollable
        :persistent="is_persistent"
        :hide-overlay="!blur_background"
        :max-width="is_fullscreen ? maxWidth : width"
    >
        <v-card ref="movable_card" :color="win.options ? win.options.main_color : undefined">
            <v-system-bar 
                v-if="has_toolbar" 
                ref="drag_region" 
                height="30px"
                :color="win.options ? win.options.toolbar_color : undefined"
                style="overflow-x: auto; overflow-y: hidden;"
            >
                <span class="px14-font">{{ window_title }}</span>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <template v-for="(icon, i) in win.toolbar">
                        <toolbar-element
                            :key="`plugin-popup-window-toolbar-element-${i}`"
                            :element="icon"
                        />
                        <v-divider
                            :key="`plugin-popup-window-toolbar-divider-${i}`"
                            v-if="i + 1 < win.toolbar.length || has_close_button || has_maximize_button"
                            vertical
                        />
                    </template>
                    <v-btn 
                        small 
                        icon 
                        @click.stop="is_fullscreen = !is_fullscreen"
                        v-if="has_maximize_button"
                    >
                        <v-icon small>mdi-plus</v-icon>
                    </v-btn>
                    <v-divider v-if="has_close_button" vertical/>
                    <v-btn 
                        small
                        icon
                        color="error"
                        @click.stop="is_window_visible = false"
                        v-if="has_close_button"
                    >
                        <v-icon small>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-system-bar>

            <v-card-text v-if="Array.isArray(win.content)" class="main-content" :style="`
                max-height: ${maxHeight}px;
                height: ${is_fullscreen ? maxHeight : height}px;
                padding-left: ${has_sidebar ? 0 : 8}px;
            `">
                <v-list
                    class="sidebar"
                    v-if="has_sidebar"
                    :style="`
                        width: 59px;
                        border-right: 1px solid rgba(${is_dark_mode ? '255' : '0'}, ${is_dark_mode ? '255' : '0'}, ${is_dark_mode ? '255' : '0'}, 0.12);
                        position: absolute;
                        height: ${(is_fullscreen ? maxHeight : height) - 20}px;
                        overflow-y: auto;
                        overflow-x: hidden;
                    `"
                >
                    <sidebar-element
                        v-for="(item) in win.sidebar"
                        :key="key(item)"
                        :action="typeof item.action !== 'function' ? () => {} : item.action"
                        :opacity="item.opacity"
                        :selected="item.is_selected"
                        :item="item"
                    />
                </v-list>
                <div :style="`
                    margin-left: ${has_sidebar ? 60 : 0}px;
                    padding-left: 8px;
                    overflow-y: auto;
                `">
                    <window-content 
                        v-for="(content) in win.content" 
                        :key="key(content)" 
                        :content="typeof content === 'function' ? content() : content"
                    />
                </div>
            </v-card-text>
            <v-card-text v-else-if="win.content" class="main-content" :style="`height: ${is_fullscreen ? maxHeight : height}px;`">
                <window-content 
                    :content="win.content"
                />
            </v-card-text>
            <v-divider v-if="win.actions != undefined"/>
            <v-card-actions v-if="win.actions != undefined">
                <window-content 
                    v-for="(content) in win.actions" 
                    :key="key(content)"
                    :content="typeof content === 'function' ? content() : content"
                    style="overflow-x: auto;"
                />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import WindowContent from "./WindowContent.vue";
import ToolbarElement from "./ToolbarElement.vue";
import SidebarElement from "./SidebarElement.vue";
import uuidv4 from "uuid/v4";
import { setInterval, clearInterval } from 'timers';

export default {
    name: "window",
    props: {
        win: Object
    },
    components: {
        WindowContent,
        ToolbarElement,
        SidebarElement
    },
    created() {
        window.addEventListener("resize", this.on_resize);
    },
    destroyed() {
        window.removeEventListener("resize", this.on_resize);
    },
    data() {
        return {
            is_fullscreen: false,
            window_height: window.innerHeight
        }
    },
    computed: {
        is_window_visible: {
            get() {
                return this.win.is_visible;
            },
            set(val) {
                this.$store.commit("setWindowIsVisible", { id: this.win.id, val })
            }
        },

        window_title() {
            return this.win.display_name || "bridge. - Unlabeled Window";
        },

        //BUTTONS
        has_close_button() {
            return !this.win.options || this.win.options.is_closable == undefined || this.win.options.is_closable;
        },
        has_maximize_button() {
            return !this.win.options || this.win.options.is_maximizable == undefined || this.win.options.is_maximizable;
        },
        has_toolbar() {
            return !this.win.options || this.win.options.is_frameless == undefined || !this.win.options.is_frameless;
        },

        //DIALOG
        blur_background() {
            return !this.win.options || this.win.options.blurs_background == undefined || this.win.options.blurs_background;
        },
        is_persistent() {
            return !this.win.options || this.win.options.is_persistent == undefined || this.win.options.is_persistent;
        },
        is_dark_mode() {
            return this.$store.state.Appearance.is_dark_mode;
        },
        width() {
            if(!this.win.options || this.win.options.width == undefined) return 500;
            return this.win.options.width;
        },
        height() {
            if(!this.win.options || this.win.options.height == undefined) return 500;
            return this.win.options.height;
        },
        maxWidth() {
            if(!this.win.options || this.win.options.maxWidth == undefined) return "90%";
            return this.win.options.maxWidth;
        },
        maxHeight() {
            if(!this.win.options || this.win.options.maxHeight == undefined) return this.window_height * 0.8;
            return this.win.options.maxHeight;
        },

        //Sidebar
        has_sidebar() {
            return this.win.sidebar != undefined;
        }
    },
    watch: {
        is_window_visible(new_val) {
            if(!new_val && typeof this.win.onClose === "function") this.win.onClose();
            if(new_val && typeof this.win.onOpen === "function") this.win.onOpen();
        }
    },
    methods: {
        on_resize() {
            this.window_height = window.innerHeight;
        },
        uuid() {
            return uuidv4();
        },
        key(c) {
            return (typeof c === 'function' ? c().key : c.key) || uuidv4();
        }
    },


    mounted() {
        let drag_region;
        if(this.$refs.drag_region != undefined) drag_region = this.$refs.drag_region.$el;

        if(drag_region && this.win.options && this.win.options.is_draggable) {
            let movable = this.$refs.movable_card.$parent.$el;

            drag_region.addEventListener("mousedown", ev => {
                if(ev.target.tagName == "I" || ev.target.tagName == "BUTTON") return;
                let start_x = ev.clientX;
                let start_y = ev.clientY;
                movable.style.left = movable.offsetLeft + "px";
                movable.style.top = movable.offsetTop + "px";

                let mousemove = ev => {
                    ev.preventDefault();
                    let off_x = start_x - ev.clientX;
                    let off_y = start_y - ev.clientY;

                    movable.style.position = "absolute";
                    movable.style.left = Number(movable.style.left.replace("px", "")) - off_x + "px";
                    movable.style.top = Number(movable.style.top.replace("px", "")) - off_y + "px";

                    start_x = ev.clientX;
                    start_y = ev.clientY;
                };
                let mouseup = ev => {
                    ev.preventDefault();
                    document.removeEventListener("mouseup", mouseup);
                    document.removeEventListener("mousemove", mousemove);
                };

                document.addEventListener("mousemove", mousemove);
                document.addEventListener("mouseup", mouseup);
            });
        }

        if(drag_region && this.has_maximize_button) {
            drag_region.addEventListener("dblclick", () => {
                this.is_fullscreen = ! this.is_fullscreen;
            })
        }
    }
}
</script>

<style scoped>
    div.container {
        padding: 0;
    }
    .v-btn {
        margin: 0 unset;
    }
    .window-title {
        margin-left: 8px;
        cursor: default;
    }
    .no-overflow {
        overflow-y: hidden;
    }

    .main-content {
        transition: all ease-in-out 160ms;
        padding: 8px;
    }
    .sidebar {
        padding: 0;
    }
</style>