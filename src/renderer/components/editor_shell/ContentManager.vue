<template>
    <div v-if="open_files.length > 0">
        <span v-for="(file, i) in open_files" :key="`file-${selected_project}-${file.uuid}-${i}`">
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
    import TabSystem from "../../scripts/TabSystem";
    import EventBus from "../../scripts/EventBus";

    export default {
        name: "editor-shell-content-manager",
        components: {
            WelcomeScreen,
            FileManager
        },
        created() {
            window.addEventListener("resize", this.on_resize);
            EventBus.on("updateTabUI", this.setOpenFiles);
            EventBus.on("updateSelectedTab", this.updateSelectedTab);
        },
        destroyed() {
            window.removeEventListener("resize", this.on_resize);
            EventBus.off("updateTabUI", this.setOpenFiles);
            EventBus.off("updateSelectedTab", this.updateSelectedTab);
        },
        data() {
            return {
                available_height: window.innerHeight - 94,
                open_files: TabSystem.filtered(),
                selected_tab: TabSystem.selected
            };
        },
        methods: {
            on_resize() {
                this.available_height = window.innerHeight - 94;
            },
            setOpenFiles() {
                this.open_files = TabSystem.filtered();
            },
            updateSelectedTab() {
                this.selected_tab = TabSystem.selected;
            }
        },
        computed: {
            // open_files() {
            //     return this.$store.getters.open_files();
            // },
            // selected_tab() {
            //     return this.$store.state.TabSystem.selected_tab;
            // },
            selected_project() {
                return this.$store.state.Explorer.project;
            },
            footer_visible() {
                return this.$store.state.Footer.elements.length > 0;
            }
        },
        watch: {
            footer_visible(new_val) {
                if(new_val) this.available_height -= 24;
                else this.available_height += 24;
            }
        }
    }
</script>