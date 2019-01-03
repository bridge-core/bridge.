<template>
    <v-layout :style="`overflow-x: ${is_mandatory ? 'scroll' : 'auto'}`" row wrap>
          <v-flex xs12 sm6 class="py-2">
            <v-btn-toggle v-model="selected_tab" :mandatory="is_mandatory">
                <v-tooltip v-for="(file, i) in open_files" :key="`${selected_project}-${i}`" :disabled="hide_tooltip" bottom>
                    <span slot="activator">
                        <v-btn flat>
                            {{ file.file }}
                            <v-icon @click.stop="closeTab(i)" ripple small>close</v-icon>
                        </v-btn>
                    </span>
                    <span>{{ file.category }}</span>
                </v-tooltip>
            </v-btn-toggle>
          </v-flex>
    </v-layout>
</template>

<script>
export default {
    name: "editor-shell-tab-system",
    data() {
        return {
            
        };
    },
    computed: {
        selected_project() {
            return this.$store.state.Explorer.project;
        },
        open_files() {
            return this.$store.getters.open_files();
        },
        selected_tab: {
            set(val) {
                this.$store.commit("setSelectedTab", val);
            },
            get() {
                return this.$store.state.TabSystem.selected_tab;
            }
        },

        hide_tooltip() {
            return true;
        },
        is_mandatory() {
            return this.open_files.length > 0;
        }
    },
    methods: {
        closeTab(i) {
            this.$store.commit("closeTab", i);
        }
    }
}
</script>

<style scoped>
    div.flex {
        padding-bottom: 0 !important;
    }

    button.v-btn {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        text-transform: none;
    }
    *::-webkit-scrollbar-track {
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
    }
    *::-webkit-scrollbar-thumb {
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
    }

    .v-icon {
        margin-left: 0.1em;
        opacity: 0.2;
        transition: all ease-in-out 300ms;
    }
    .v-icon:hover {
        opacity: 1;
    }
</style>
