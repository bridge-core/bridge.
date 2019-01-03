<template>
    <v-tooltip :disabled="!show_display_name" top>
        <v-badge :class="has_click_action ? 'change-cursor' : ''" @click.stop.native="click" v-model="show_badge" slot="activator" overlap bottom left small :color="badge_color">
            <span slot="badge">
                <v-icon small v-if="badge_type == 'icon'">{{ badge_content }}</v-icon>
                <span v-else>{{ badge_content }}</span>
            </span>
            <v-icon>{{ display_icon }}</v-icon>
        </v-badge>

        <span>{{ display_name }}</span>
    </v-tooltip>
</template>

<script>
export default {
    name: "footer-element",
    props: {
        element: Object
    },
    computed: {
        badge_color() {
            if(!this.element.badge || !this.element.badge.color) return "primary";
            return this.element.badge.color;
        },
        badge_type() {
            if(!this.element.badge || !this.element.badge.type) return "text";
            return this.element.badge.type;
        },
        badge_content() {
            if(!this.element.badge || !this.element.badge.content) return "";
            return this.element.badge.content;
        },
        show_badge() {
            return this.element.badge != undefined && this.badge_content != "";
        },

        display_name() {
            return this.element.display_name;
        },
        show_display_name() {
            return this.display_name && this.display_name != "";
        },

        display_icon() {
            if(!this.element.display_icon || this.element.display_icon == "") return "assignment";
            return this.element.display_icon;
        },

        click() {
            if(typeof this.element.action != "function") return () => {};
            return this.element.action;
        },
        has_click_action() {
            return typeof this.element.action == "function";
        }
    }
}
</script>

<style scoped>
    span.v-badge {
        margin-right: 12px;
    }
    .change-cursor {
        cursor: pointer;
    }
    .no-badge {
        margin-top: 10px;
    }
</style>
