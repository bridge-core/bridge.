<template>
    <span class="hl-wrapper">
        <span v-for="(string, i) in text_as_array" :key="i" :class="class_name(string)">{{ string }}</span>
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
                return this.$store.getters.highlighter_keywords;
            },
            titles() {
                return this.$store.getters.highlighter_titles;
            },
            symbols() {
                return this.$store.getters.highlighter_symbols;
            },
            text() {
                if(this.$slots.default) return (this.$slots.default[0].text + "").trim();
                return "";
            },
            text_as_array() {
                return this.text.replace(/:|<|>/g, (match) => {
                    return `&bridge.split-point;${match}&bridge.split-point;`
                }).split("&bridge.split-point;");
            }     
        },
        methods: {
            class_name(string) {
                if(this.keywords.includes(string)) {
                    return "hljs-keyword";
                } else if(this.titles.includes(string)) {
                    return "hljs-title";
                } else if(this.symbols.includes(string)) {
                    return "hljs-symbol";
                }
            }
        }
    }
</script>
