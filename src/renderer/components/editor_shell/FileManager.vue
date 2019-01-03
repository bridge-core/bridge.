<template>
    <span>
        <v-container v-if="extension == 'png'">
            <v-img :src="image" :style="`max-height: ${available_height}px;`"/>
        </v-container>
        <json-editor-main v-else-if="extension == 'json' && false" :compiled="file.compiled" :tab_id="tab_id" :object="json_object" :available_height="available_height" :uuid="use_uuid"></json-editor-main>
        <quill-editor 
            v-else
            :content="text"
            :tab_id="tab_id"
            :height="available_height"
            :extension="extension"
        >
        </quill-editor>
    </span>
</template>

<script>
    import QuillEditor from "./QuillEditor";
    import JsonEditorMain from "./JsonEditor/Main";

    export default {
        name: "file-manager",
        components: {
            QuillEditor,
            JsonEditorMain
        },
        props: {
            file: Object,
            available_height: Number,
            tab_id: Number, 
            uuid: String
        },
        computed: {
            extension() {
                if (this.file) return this.file.file.split(".").pop().toLowerCase();
            },
            use_uuid() {
                return `${this.uuid}-${Math.random()})`;
            },

            //FILE CONTENT
            image() {
                if (this.file) {
                    let base64Data = btoa(String.fromCharCode.apply(null, this.file.content));
                    return `data:image/${this.extension};base64,${base64Data}`;
                }
            },
            text() {
                if (this.file) {
                    try {
                        return new TextDecoder('utf-8').decode(this.file.content);
                    } catch(err) {
                        return this.file.content;
                    } 
                }
                return undefined;
            },
            json_object() {
                try {
                    return JSON.parse(this.text);
                } catch(e) {
                    return this.text;
                }
            }
        }
    }
</script>

