<template>
<div>
    <v-text-field
        prepend-icon="mdi-magnify"
        v-model="search"
    ></v-text-field>
    <v-divider/>
    <v-list three-line>
        <v-layout v-if="plugins == undefined" justify-center>
            <v-progress-circular
                :size="70"
                :width="5"
                color="info"
                indeterminate
            ></v-progress-circular>
        </v-layout>
        
        <div v-else-if="Object.keys(plugins).length > 0">
            <cloud-plugin 
                v-for="(plugin, key, i) in plugins" 
                :key="`plugin-window-element-${key}`"
                :plugin_key="key"
                :plugin="plugin"
                :plugins="plugins"
                :search="search"
                :last="Object.keys(plugins).length - 1 == i"
                :is_fullscreen="is_fullscreen"
                :installed_plugins="installed_plugins"
            />
        </div>
        
        <v-layout justify-center v-else>
            <h3>
                {{ no_plugins_message }}
            </h3>
        </v-layout>
    </v-list>
</div>
</template>

<script>
import CloudPlugin from "./CloudPlugin.vue";

export default {
    name: "web-plugins",
    components: {
        CloudPlugin
    },
    props: {
        plugins: Object,
        is_fullscreen: Boolean,
        installed_plugins: Array
    },
    data() {
        return {
            search: ""
        }
    },
    computed: {
        no_plugins_message() {
            return "Unable to find cloud plugins :("
        }
    }
}
</script>
