<template>
    <summary :class="selected_class" v-on:keydown.enter="open_current" :id="'summary.' + object_key" v-ripple>
        <v-icon :class="`${inversed_arrows ? 'open' : 'closed'}`" small>keyboard_arrow_down</v-icon>
        <v-icon :class="`${inversed_arrows ? 'closed' : 'open'}`" small>keyboard_arrow_up</v-icon>
        <highlight-text
            :style="`background: ${mark.replace(/;|:/g, '')};`"
            class="object"
        >
        {{ my_key }}
        </highlight-text>
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
            }
        },
        computed: {
            selected_class() {
                if(this.$el && this.is_selected()) this.$el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
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

    div, span.key {
        padding-left: 0.75em;
    }
    span.comment {
        padding-left: 2em;
        font-style: normal;
    }
    
    summary::-webkit-details-marker {
        display: none
    }
    details[open]  > summary > .open {
        display: inline;
    }
    details > summary > .open {
        display: none;
    }
    details[open]  > summary > .closed {
        display: none;
    }
    details > summary > .closed {
        display: inline;
    }
</style>