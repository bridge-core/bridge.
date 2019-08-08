<template>
    <v-tooltip right>
        <template v-slot:activator="{ on }">
            <v-list-item v-on="on" @click.stop="action">
                <v-list-item-action>
                    <v-layout align-center>
                        <v-icon medium :style="`opacity: ${opacity};`" :color="item.color">{{ item.icon }}</v-icon>
                    </v-layout>
                </v-list-item-action>
            </v-list-item>
        </template>
        
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
