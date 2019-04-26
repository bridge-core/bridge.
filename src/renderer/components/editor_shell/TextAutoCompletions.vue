<template>
    <v-menu
        v-model="show_menu"
        absolute
        :max-height="200"
        :position-x="x"
        :position-y="y"
        :z-index="100000"
    >
        <v-list class="text-auto-completion-list" dense>
            <v-list-tile
                v-for="(e, i) in propose"
                :key="e"
                @click="insert(e)"
            >
                <v-list-tile-title>{{ e }}</v-list-tile-title>
            </v-list-tile>
        </v-list>
    </v-menu>
</template>

<script>
    import TextProvider from "../../scripts/autoCompletions/TextProvider";
    import EventBus from "../../scripts/EventBus";

    export default {
        name: "text-auto-completions",
        data() {
            return {
                show_menu: true,
                x: 100,
                y: 100,
                propose: []
            }
        },
        mounted() {
            window.addEventListener("mousemove", this.updatePosition);
            EventBus.on("bridge:textProviderUpdate", this.updateSuggestions)
        },
        destroyed() {
            window.removeEventListener("mousemove", this.updatePosition);
            EventBus.off("bridge:textProviderUpdate", this.updateSuggestions)
        },
        methods: {
            updatePosition(event) {
                this.x = event.clientX;
                this.y = event.clientY;
            },
            updateSuggestions(event, propose) {
                this.propose = propose.object.concat(propose.value);
                if(this.propose.length > 0) this.show_menu = true;
                console.log(this.x, this.y, this.show_menu);
            },
            insert(str) {
                EventBus.trigger("setCMSelection", str);
                EventBus.trigger("bridge:cmFocus");
            }
        }
    }
</script>

<style>
    .text-auto-completion-list a.v-list__tile {
        height: 26px !important;
    }
</style>
