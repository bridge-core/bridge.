<template>
    <div>
        <content-explorer
            v-if="menu_type === 'explorer'"
            key="explorer"
            explorer_type="explorer"
            :base_path="BASE_PATH"
            :load_plugins="true"
        />
        <content-explorer
            v-else-if="menu_type === 'resource_pack'"
            key="resource_pack"
            explorer_type="resource_pack"
            :base_path="RP_BASE_PATH"
            :load_plugins="false"
            :force_project_algorithm="findRP"
            toolbar_component="explorer-rp-toolbar"
        />
        <content-plugins v-else-if="menu_type === 'extensions'"/>
        <content-documentation v-else-if="menu_type === 'documentation'"/>
        <content-custom v-else-if="sidebar.is_plugin" :content="sidebar.content" :toolbar="sidebar.toolbar"/>
        <content-not-implemented v-else/>
    </div>
</template>

<script>
    import ContentExplorer from "./content/Explorer";
    import ContentDocumentation from "./content/Documentation";
    import ContentPlugins from "./content/Plugins";
    import ContentCustom from "./content/Custom";
    import ContentNotImplemented from "./content/NotImplemented";
    
    import { BASE_PATH, RP_BASE_PATH } from "../../scripts/constants";
    import findRP from "../../scripts/utilities/FindRP";

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
        },
        data() {
            return {
                BASE_PATH,
                RP_BASE_PATH,
                findRP
            }
        }
    }
</script>