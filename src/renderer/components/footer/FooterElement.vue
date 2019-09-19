<template>
    <v-chip
        class="ma-1"
        :color="chip_color"
        :text-color="text_color"
        @click.stop="click"
    >
       <v-badge
            :class="has_click_action ? 'change-cursor' : ''"
            v-model="show_badge"
            overlap
            top
            left
            small
            :color="badge_color"
        >
            <template v-slot:badge>
                <v-icon small v-if="badge_type == 'icon'">{{ badge_content }}</v-icon>
                <span v-else>{{ badge_content }}</span>
            </template>
            <v-icon>{{ display_icon }}</v-icon>
            <span>{{ display_name }}</span>
        </v-badge>
    </v-chip>
</template>

<script>
export default {
    name: "footer-element",
    props: {
        element: Object
    },
    computed: {
        chip_color() {
            return this.element.color || "primary";
        },
        text_color() {
            return this.element.text_color || "white";
        },
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
            return this.display_name && this.display_name !== "";
        },

        display_icon() {
            if(!this.element.display_icon || this.element.display_icon === "") return "mdi-crop-square";
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
    /* span.v-badge {
        margin-right: 12px;
    } */
    .change-cursor {
        cursor: pointer;
    }
    .no-badge {
        margin-top: 10px;
    }
</style>
