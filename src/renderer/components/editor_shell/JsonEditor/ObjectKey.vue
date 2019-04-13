<template>
    <summary
        @contextmenu="openContextMenu"
        :class="selected_class"
        v-on:keydown.enter="open_current"
        :id="'summary.' + object_key"
        @click="(event) => $emit('mainClick', event)"
        @dblclick="() => $store.state.Settings.cade_node_click ? $emit('arrowClick') : undefined"
    >
        <v-btn
            icon
            flat
            small
            style="margin: 0; height: 16px; width: 16px;"
            @click="$emit('arrowClick')"
        >
            <v-icon
                v-if="inversed_arrows && context.open || !inversed_arrows && !context.open"
                small
            >keyboard_arrow_down</v-icon>
            <v-icon
                v-if="!inversed_arrows && context.open || inversed_arrows && !context.open"
                small
            >keyboard_arrow_up</v-icon>
        </v-btn>

        <v-tooltip
            v-if="error && error.show"
            :open-delay="1400"
            right
            :nudge-right="error.fix ? 12 : 0"
            :color="error.is_warning ? 'amber darken-2' : 'error'"
        >
            <highlight-text
                slot="activator"
                :style="`background: ${mark.replace(/;|:/g, '')};`"
                :class="`object ${error.is_warning ? 'warning-line' : 'error-line'}`"
            >
            {{ my_key }}
            </highlight-text>
            <span>{{ error.message }}</span>
        </v-tooltip>
        <highlight-text
            v-else
            slot="activator"
            :style="`background: ${mark.replace(/;|:/g, '')};`"
            class="object"
            v-ripple
        >
        {{ my_key }}
        </highlight-text>
        
        <v-icon v-if="$store.state.Settings.error_icon_indicator && child_contains_error" color="error" small>mdi-alert-circle</v-icon>
        <v-tooltip
            v-if="$store.state.Settings.error_auto_fix && error && error.fix"
            color="amber darken-2"
            right
        >
            <v-btn
                slot="activator"
                color="amber darken-1"
                @click.native="error.fix.function(context)"
                style="margin: 0; height: 20px; width: 20px;"
                flat
                small
                icon
            >
                <v-icon small>mdi-lightbulb</v-icon>
            </v-btn>
            <span>{{ error.fix.text || 'Auto-fix' }}</span>
        </v-tooltip>

        <span v-if="comment && comment != ''" class="comment" :style="color_theme.comment">//{{ comment }}</span>
    </summary>
</template>

<script>
    import Main from "./Main";
    import HighlightText from "./HighlightText";
    import TabSystem from "../../../scripts/TabSystem";

    export default {
        name: "object-key",
        components: {
            Main,
            HighlightText
        },
        props: {
            my_key: [String, Number],
            object_key: String,
            comment: String,
            mark: {
                default: "none",
                type: String
            },
            object: Object,
            error: Object,
            child_contains_error: Boolean,
            context: Object
        },
        computed: {
            selected_class() {
                if(this.$el && this.is_selected() && this.$store.state.Settings.auto_scroll_json) this.$el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                return this.is_selected() ? "selected" : "";
            },
            inversed_arrows() {
                return this.$store.state.Settings.inversed_arrows;
            },

            is_dark_mode() {
                return this.$store.state.Appearance.is_dark_mode;
            },
            color_theme() {
                return this.is_dark_mode ? this.$store.state.Appearance.color_theme.dark : this.$store.state.Appearance.color_theme.light;
            }
        },
        methods: {
            is_selected() {
                return TabSystem.getCurrentNavigation() == this.object_key;
                //return this.$store.getters.current_internal_file_path() == this.object_key;
            },
            open_current() {
                this.$root.$emit(`load(${this.tab_id}):${this.object_key}`);
            },
            openContextMenu(event) {
                TabSystem.setCurrentFileNav(this.object_key);
                let data;
                if(Number.isNaN(Number(this.my_key))) data = `"${this.my_key}": ${JSON.stringify(this.object.toJSON(), null, "\t")}`;
                else data = JSON.stringify(this.object.toJSON(), null, "\t");

                this.$store.commit("showEditorHoverCard", {
                    data,
                    x_position: event.clientX,
                    y_position: event.clientY
                });
            }
        }
    }
</script>

<style scoped>
    summary {
        outline: none;
        cursor: pointer;
        transition: all ease-in-out 0.1s;
    }
    summary.selected {
        font-style: italic;
        background: rgba(119, 119, 119, 0.1);
    }

    span.key {
        padding-left: 0.75em;
    }
    span.comment {
        padding-left: 2em;
        font-style: normal;
    }
    
    summary::-webkit-details-marker {
        display: none
    }

    .error-line {
        border-bottom: 2px dotted #F44336;
    }
    .warning-line {
        border-bottom: 2px dotted #FFA000;
    }
    button::before {
        opacity: 0.2;
    }
</style>