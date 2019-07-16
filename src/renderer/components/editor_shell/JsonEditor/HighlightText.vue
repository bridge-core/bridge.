<template>
    <span class="hl-wrapper">
        <span v-for="(string, i) in text_as_array" :key="`${text}.${i}`" :style="styles(string)">{{ string }}</span>
    </span>
</template>

<script>
    export default {
        name: "highlight-text",
        props: {
            
        },
        data() {
            return {
                
            };
        },  
        computed: {
            keywords() {
                return this.$store.getters.highlighter_keywords();
            },
            titles() {
                return this.$store.getters.highlighter_titles();
            },
            symbols() {
                return this.$store.getters.highlighter_symbols();
            },
            text() {
                if(this.$slots.default) return (this.$slots.default[0].text + "").trim();
                return "";
            },
            text_as_array() {
                return this.text.replace(/:|<|>|\.|\s|\(|\)/g, (match) => {
                    return `&bridge.split-point;${match}&bridge.split-point;`
                }).split("&bridge.split-point;");
            },
            is_dark_mode() {
                return this.$store.state.Appearance.is_dark_mode;
            },
            color_theme() {
                return this.is_dark_mode ? this.$store.state.Appearance.color_theme.dark : this.$store.state.Appearance.color_theme.light;
            }
        },
        methods: {
            styles(string) {
                if(this.keywords.includes(string)) {
                    return this.color_theme.keyword;
                } else if(this.titles.includes(string)) {
                    return this.color_theme.property;
                } else if(this.symbols.includes(string)) {
                    return this.color_theme.definition;
                }
            }
        }
    }
</script>
