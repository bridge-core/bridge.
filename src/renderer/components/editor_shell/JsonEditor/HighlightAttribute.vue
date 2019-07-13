<template>
    <span :style="styles + (as_block ? 'display: block;' : '')">
        <highlight-text
            v-if="use_advanced_parsing"
            @click.stop.native="(event) => $emit('click', event)"
        >{{ text }}</highlight-text>
        <span
            v-else
            @click.stop="(event) => $emit('click', event)"
        >{{ text }}</span>

        <v-tooltip
            v-if="meta.is_molang && text !== ''"
            color="success"
            right
        >
            <v-btn
                slot="activator"
                color="success"
                style="margin: 0; margin-left: 4px; height: 20px; width: 20px;"
                flat
                small
                icon
                @click="editMoLang"
            >
                <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <span>Edit</span>
        </v-tooltip>
    </span>
</template>

<script>
    import HighlightText from "./HighlightText";
    import EditMoLangWindow from "../../../windows/EditMoLang";

    export default {
        name: "highlight-attribute",
        props: {
            data: [ String, Boolean, Number ],
            meta: Object,
            node_context: Object,
            as_block: {
                default: true,
                type: Boolean
            }
        },
        components: {
            HighlightText
        },
        computed: {
            text() {
                if(this.data != undefined) return (this.data + "").trim();
                return this.data;
            },
            styles() {
                if(this.text == "true" || this.text == "false" || this.text == "undefined") {
                    return this.color_theme.atom;
                } else if(isNaN(this.text)) {
                    return this.color_theme.string;
                } else {
                    return this.color_theme.number;
                }
            },
            use_advanced_parsing() {
                return isNaN(this.text) && !(this.text === "true" || this.text === "false" || this.text === "undfined") && this.text.match(/:|<|>|\.|\s/g) != null;
            },

            is_dark_mode() {
                return this.$store.state.Appearance.is_dark_mode;
            },
            color_theme() {
                return this.is_dark_mode ? this.$store.state.Appearance.color_theme.dark : this.$store.state.Appearance.color_theme.light;
            }
        },
        methods: {
            editMoLang() {
                new EditMoLangWindow(this.text, this.node_context);
            }
        }
    }
</script>