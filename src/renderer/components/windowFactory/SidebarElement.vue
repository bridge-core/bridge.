<template>
    <v-tooltip right>
        <v-list-tile slot="activator" @click.stop="action">

            <v-list-tile-action>
                <v-layout align-center>
                    <v-icon medium :style="`opacity: ${opacity};`">{{ item.icon }}</v-icon>
                </v-layout>

            </v-list-tile-action>
        </v-list-tile>
        <span>{{ item.title }}</span>
    </v-tooltip>
</template>

<script>
    export default {
        name: "sidebar-element",
        props: {
            item: Object,
            opacity: {
                type: Number,
                default: 1
            },
            action: Function
        }
    }
</script>

<style scoped>
    span {
        cursor: pointer;
    }
</style>
