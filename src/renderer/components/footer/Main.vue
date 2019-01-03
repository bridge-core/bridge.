<template>
<span class="footer-container">
    <footer-element v-for="(el, i) in footer_elements" :element="el" :key="`footer-element-${i}`"/>
</span>
    
</template>

<script>
import FooterElement from "./FooterElement";

export default {
    name: "footer-main",
    components: {
        FooterElement
    },
    computed: {
        footer_elements() {
            return this.$store.state.Footer.elements;
        }
    }
}
</script>

<style scoped>
    span {
        cursor: default;
    }
    .footer-container {
        padding: 2px 12px 0 12px;
        margin: 0 4px;
        overflow-x: scroll;
        overflow-y: hidden;
        height: 100%;
        white-space: nowrap;
    }
</style>
