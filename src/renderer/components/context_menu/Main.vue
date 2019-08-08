<template>
    <div>
        <v-menu
            v-model="is_visible"
            :position-x="x_position"
            :position-y="y_position"
            absolute
            style="z-index: 202;"
            transition="scale-transition"
        >
            <v-list class="context-menu">
                <v-list-item
                    v-for="(item, i) in items"
                    :key="`${y_position}.${x_position}.${i}`"
                    @click="item.action"
                    dense
                >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <div
            class="context-overlay"
            :style="`display: ${is_visible ? 'block' : 'none'};`"
            @contextmenu="() => is_visible = false"
        />
    </div>    
</template>

<script>
    export default {
        name: "context-menu-main",
        data() {
            return {

            }
        },
        computed: {
            is_visible: {
                get() {
                    return this.$store.state.ContextMenu.is_visible;
                },
                set(value) {
                    this.$store.commit("setContextMenuVisibility", value);
                }
            },
            x_position() {
                return this.$store.state.ContextMenu.x_position;
            },
            y_position() {
                return this.$store.state.ContextMenu.y_position;
            },
            items() {
                return this.$store.state.ContextMenu.menu;
            }
        }
    }
</script>

<style>
    .context-menu .v-list__tile {
        height: 30px !important;
    }

    .context-overlay:before {
        content: '';

        height: 100%;
        width: 100%;

        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        
        transition: inherit;
        transition-delay: 150ms;
    }
    .context-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        z-index: 201;
    }
</style>