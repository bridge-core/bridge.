<template>
    <v-layout
        :style="`padding: 10em; height: ${available_height}px;`"
        @dblclick="createFile"
        column
    >
        <h1>Welcome to bridge.</h1>
        <div>
            <br>
            <p>
                Creating Minecraft addons has never been more convenient!
            </p>
            <ul>
                <li>
                    <v-icon small>mdi-auto-fix</v-icon>
                    <span>Syntax highlighting</span>
                </li>
                <li>
                    <v-icon small>mdi-format-list-bulleted</v-icon>
                    <span>Rich auto-completions</span>
                </li>
                <li>
                    <v-icon small>mdi-folder-multiple</v-icon>
                    <span>Easy project management</span>
                </li>
                <li>
                    <v-icon small>mdi-json</v-icon>
                    <span>Custom addon syntax</span>
                </li>
                <li>
                    <v-icon small>mdi-nodejs</v-icon>
                    <span>Customizable through plugins</span>
                </li>
            </ul>
        </div>
    </v-layout>
</template>

<script>
    import TabSystem from '../../scripts/TabSystem';
    import path from "path";
    import { CURRENT } from '../../scripts/constants';

    export default {
        name: "welcome-screen",
        props: {
            available_height: Number
        },
        methods: {
            createFile(event) {
                TabSystem.add({
                    file_version: 0,
                    content: "",
                    raw_content: new Buffer(""),
                    file_path: path.join(CURRENT.PROJECT_PATH, "untitled.txt"),
                    is_compiled: false,
                    category: CURRENT.PROJECT,
                    file_name: "untitled.txt"
                });
            }
        }
    }
</script>

<style scoped>
    div, li {
        list-style-type: none;
        text-align: center;
    }
    span {
        margin-left: 4px;
    }
</style>
