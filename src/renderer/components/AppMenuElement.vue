<template>
    <span v-if="!element.is_hidden">
        <v-list-tile v-if="!element.type || element.type == 'standard'" @click.stop="click()">
            <v-list-tile-content>
                <v-list-tile-title>{{ element.title }}</v-list-tile-title>
                <v-list-tile-sub-title v-if="element.subtitle">{{ element.subtitle }}</v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
                <v-list-tile-action-text>{{ element.shortcut }}</v-list-tile-action-text>
            </v-list-tile-action>
        </v-list-tile>

        <slot
            v-else-if="element.type == 'submenu'"
            :menu="{ elements: element.elements }"
            :submenu="element"
        ></slot>

        <v-divider v-else></v-divider>
    </span>
</template>

<script>
import AppMenu from "./AppMenu.vue";

export default {
    name: "app-menu-element",
    props: {
        element: Object
    },
    
    components: {
        AppMenu: AppMenu || this.AppMenu
    },
    computed: {
        
    },
    methods: {
        click(action=this.element.action) {
            this.$root.$emit("close-all-menus");
            if(typeof action != "function") return () => {};
            return action();
        }
    }
}
</script>
