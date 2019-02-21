<template>
    <v-layout justify-center align-center column>
        <h1>Welcome to bridge.</h1>
        <div>
            <br>
            <p>
                Creating Minecraft addons was never more convenient!
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
export default {
    name: "welcome-screen"
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
