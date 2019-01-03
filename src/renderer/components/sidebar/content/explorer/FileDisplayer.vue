<template>
    <p v-if="first && (!files || files.length == 0)">
        This directory has no content.
    </p>
    <div :style="element_style" :class="element_class" v-else>
        <details v-for="(file, i) in files" :key="i" v-if="file.type == 'directory'">
            <summary v-ripple>
                <v-icon class="open" small>folder_open</v-icon><v-icon class="closed" small>folder</v-icon><span class="folder"> {{ file.name }}</span>
            </summary>
            <file-displayer :files="file.children" :first="false" :project="project"></file-displayer>
        </details>
        <div v-else class="file" @click.stop="openFile(project + '\\' + file.path)" v-ripple>
            <v-icon small>{{ icon(getExtension(file.name)) }}</v-icon>  {{ file.name }}
        </div>
    </div>
</template>

<script>
    import { ipcRenderer } from "electron";

    export default {
        name: "file-displayer",
        props: {
            files: Array,
            project: String,
            first: {
                default: true,
                type: Boolean
            }
        },
        data() {
            return {
                file_displayer_height: window.innerHeight - 199
            };
        },
        created() {
            if(this.first) window.addEventListener("resize", this.on_resize);
        },
        destroyed() {
            if(this.first) window.removeEventListener("resize", this.on_resize);
        },
        computed: {
            element_style() {
                return this.first ? `max-height: ${this.file_displayer_height}px;` : "";
            },
            element_class() {
                return this.first ? "file-displayer" : "";
            }
        },
        methods: {
            openFile(path) {
                ipcRenderer.send("getFile", { path: path.replace(/\\/g, "/") });
            },
            getExtension(name) {
                return name.split(".").pop();
            },
            icon(ext) {
                return this.$store.state.Appearance.files[ext] ? this.$store.state.Appearance.files[ext] : "mdi-file-document-outline";
            },
            on_resize(e) {
                this.file_displayer_height = window.innerHeight - 199;
            }
        }
    }
</script>

<style scoped>
    div {
        padding-left: 0.5em;
    }
    div.file {
        cursor: pointer;
        overflow-x: auto;
        white-space: nowrap;
    }
    div.file::-webkit-scrollbar, span.folder::-webkit-scrollbar  {
        width: 2px;
        height: 2px;
    }
    span.folder {
        overflow-x: auto;
        white-space: nowrap;
    }

    summary {
        outline: none;
        cursor: pointer;
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

    .file-displayer {
        overflow-y: auto;
    }
</style>