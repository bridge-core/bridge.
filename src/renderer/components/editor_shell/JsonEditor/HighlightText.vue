<template>
    <span class="hl-wrapper">
        <span v-for="(string, i) in text_as_array" :key="`${text}.${i}`" :class="style_class(string)">{{ string }}</span>
    </span>
</template>

<script>
    import EventBus from '../../../scripts/EventBus';

    export default {
        name: "highlight-text",
        mounted() {
            // EventBus.on("updateSelectedTab", this.updateWords);
            EventBus.on("bridge:pluginsLoaded", this.updateWords);
        },
        destroyed() {
            // EventBus.off("updateSelectedTab", this.updateWords);
            EventBus.off("bridge:pluginsLoaded", this.updateWords);
        },
        data() {
            return {
                keywords: this.$store.getters.highlighter_keywords(),
                titles: this.$store.getters.highlighter_titles(),
                symbols: this.$store.getters.highlighter_symbols()
            };
        },  
        computed: {
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
            style_class(string) {
                const check_obj = { keyword: this.keywords, property: this.titles, def: this.symbols };

                for(let check in check_obj) {
                    if(check_obj[check].includes(string)) {
                        return "cm-" + check;
                    }
                }
            },
            updateWords() {
                this.keywords = this.$store.getters.highlighter_keywords();
                this.titles = this.$store.getters.highlighter_titles();
                this.symbols = this.$store.getters.highlighter_symbols();
            }
        }
    }
</script>
