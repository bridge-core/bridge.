<template>
    <summary :class="selected_class" v-ripple>
        <v-icon class="open" small>keyboard_arrow_down</v-icon>
        <v-icon class="closed" small>keyboard_arrow_up</v-icon>
        <highlight-text class="object"> {{ my_key }}</highlight-text>
        <span v-if="comment != ''" class="comment hljs-comment">//{{ comment }}</span>
    </summary>  
</template>

<script>
    import Main from "./Main";
    import HighlightText from "./HighlightText";

    export default {
        name: "object-key",
        components: {
            Main,
            HighlightText
        },
        props: {
            my_key: [String, Number],
            object_key: String,
            comment: String
        },
        computed: {
            selected_class() {
                if(this.$el && this.is_selected()) this.$el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                return this.is_selected() ? "selected" : "";
            }
        },
        methods: {
            is_selected() {
                return this.$store.getters.current_internal_file_path() == this.object_key;
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
        background: rgba(255, 255, 255, 0.05);
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