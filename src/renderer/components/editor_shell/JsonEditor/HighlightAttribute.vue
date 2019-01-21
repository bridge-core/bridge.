<template>
    <div :style="styles">
        <highlight-text v-if="use_advanced_parsing">{{ text }}</highlight-text>
        <span v-else>{{ text }}</span>
    </div>
</template>

<script>
    import HighlightText from "./HighlightText";

    export default {
        name: "highlight-attribute",
        props: {
            data: [ String, Boolean, Number ]
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
                return isNaN(this.text) && !(this.text == "true" || this.text == "false" || this.text == "undfined") && this.text.match(/:|<|>/g) != null;
            },

            is_dark_mode() {
                return this.$store.state.Appearance.is_dark_mode;
            },
            color_theme() {
                return this.is_dark_mode ? this.$store.state.Appearance.color_theme.dark : this.$store.state.Appearance.color_theme.light;
            }
        }
    }
</script>