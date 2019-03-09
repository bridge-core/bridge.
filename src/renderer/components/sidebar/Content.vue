<template>
    <div>
        <content-explorer v-if="menu_type == 'explorer'"></content-explorer>
        <content-plugins v-else-if="menu_type == 'extensions'"></content-plugins>
        <content-documentation v-else-if="menu_type == 'documentation'"></content-documentation>
        <content-custom v-else-if="sidebar.is_plugin" :content="sidebar.content" :toolbar="sidebar.toolbar"></content-custom>
        <content-not-implemented v-else></content-not-implemented>
    </div>
</template>

<script>
    import ContentExplorer from "./content/Explorer";
    import ContentDocumentation from "./content/Documentation";
    import ContentPlugins from "./content/Plugins";
    import ContentCustom from "./content/Custom";
    import ContentNotImplemented from "./content/NotImplemented";

    export default {
        name: "sidebar-content",
        props: {
            sidebar: Object,
            menu_type: String
        },
        components: {
            ContentExplorer,
            ContentPlugins,
            ContentCustom,
            ContentNotImplemented,
            ContentDocumentation
        }
    }
</script>