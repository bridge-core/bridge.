<template>
    <div :class="class_name">
        <highlight-text v-if="use_advanced_parsing">{{ text }}</highlight-text>
        <span v-else>{{ text }}</span>
    </div>
</template>

<script>
    import HighlightText from "./HighlightText";

    export default {
        name: "highlight-attribute",
        props: {
            
        },
        components: {
            HighlightText
        },
        computed: {
            text() {
                if(this.$slots.default) return (this.$slots.default[0].text + "").trim();
                return "";
            },
            class_name() {
                if(this.text == "true" || this.text == "false" || this.text == "undfined") {
                    return "hljs-literal";
                } else if(isNaN(this.text)) {
                    return "hljs-string";
                } else {
                    return "hljs-number";
                }
            },
            use_advanced_parsing() {
                return this.class_name == "hljs-string" && this.text.match(/:|<|>/g) != null;
            }
        }
    }
</script>