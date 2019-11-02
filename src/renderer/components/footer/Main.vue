<template>
    <span class="footer-container">
        <footer-element v-for="(el, i) in footer_elements" :element="el" :key="`footer-element-${i}`"/>
    </span>
</template>

<script>
    import FooterElement from "./FooterElement";
    import EventBus from "../../scripts/EventBus";

    export default {
        name: "footer-main",
        components: {
            FooterElement
        },
        computed: {
            footer_elements() {
                return this.$store.state.Footer.elements;
            }
        },
        watch: {
            footer_elements(to) {
                if(to.length === 0) EventBus.trigger("footerResize", false);
                else EventBus.trigger("footerResize", true);
            }
        }
    }
</script>

<style scoped>
    span {
        cursor: default;
    }
    .footer-container {
        padding: 2px 12px 4px 12px;
        margin: 0 4px;
        overflow-x: auto;
        overflow-y: hidden;
        height: 100%;
        white-space: nowrap;
    }
    .footer-container::-webkit-scrollbar {
        width: 3px;
        height: 3px;
    }
</style>
