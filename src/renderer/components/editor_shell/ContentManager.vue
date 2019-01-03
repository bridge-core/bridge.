<template>
    <div v-if="open_files.length > 0">
        <span v-for="(file, i) in open_files" :key="`file-${file.uuid}-${i}`">
            <file-manager 
                v-if="selected_tab == i" 
                :file="file" 
                :available_height="available_height"
                :tab_id="i"
                :uuid="`(${selected_project}-${i}`"
            ></file-manager>
        </span> 
    </div>
    <welcome-screen v-else></welcome-screen> 
</template>

<script>
    import FileManager from "./FileManager";
    import WelcomeScreen from "./WelcomeScreen";

    export default {
        name: "editor-shell-content-manager",
        components: {
            WelcomeScreen,
            FileManager
        },
        created() {
            window.addEventListener("resize", this.on_resize); 
        },
        destroyed() {
            window.removeEventListener("resize", this.on_resize);
        },
        data() {
            return {
                available_height: window.innerHeight - 164
            };
        },
        methods: {
            on_resize() {
                this.available_height = window.innerHeight - 164;
            }
        },
        computed: {
            open_files() {
                return this.$store.getters.open_files();
            },
            selected_tab() {
                return this.$store.state.TabSystem.selected_tab;
            },
            selected_project() {
                return this.$store.state.Explorer.project;
            }
        },
        watch: {
            
        }
    }
</script>

<style scoped>
    * {
        image-rendering: pixelated;
    }
    img {
        max-height: 100%;
    }
</style>
