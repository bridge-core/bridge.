<template>
    <div v-if="content != undefined || sidebar != undefined">
        <v-toolbar color="expanded_sidebar" flat v-if="show_toolbar" height="30px">
            <toolbar-element
                v-for="(el, i) in toolbar" 
                :key="`plugin-toolbar-element-${i}`"
                :element="el"
            />
        </v-toolbar>
        <v-divider/>

        <div class="container" :style="`height: ${height}px; overflow-y: auto;`" v-if="Array.isArray(content)">
            <window-content 
                v-for="(c, i) in content" 
                :key="`plugin-sidebar-content-${i}`"
                :content="c"
            />
        </div>
        <div class="container" :style="`height: ${height}px; overflow-y: auto;`" v-else>
            <window-content
                :content="content"
            />
        </div>
        <v-divider></v-divider>
    </div>
</template>

<script>
    import ToolbarElement from "../../windowFactory/ToolbarElement";
    import WindowContent from "../../windowFactory/WindowContent";

    export default {
        name: "content-custom",
        props: {
            content: [Object, Array],
            toolbar: Array
        },
        components: {
            ToolbarElement,
            WindowContent
        },
        data() {
            return {
                height: window.innerHeight - 116
            };
        },
        computed: {
            text() {
                return this.content.text;
            },

            show_toolbar() {
                return this.toolbar != undefined;
            }
        },
        methods: {
            on_resize(e) {
                this.height = window.innerHeight - 116;
            }
        },

        created() {
            if(this.first) window.addEventListener("resize", this.on_resize);
        },
        destroyed() {
            if(this.first) window.removeEventListener("resize", this.on_resize);
        }
    }
</script>

<style scoped>
    div.container {
        padding: 4px;
    }
</style>
