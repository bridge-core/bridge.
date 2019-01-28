<template>
  <div id="app">
    <v-app :dark="$store.state.Appearance.is_dark_mode">
      <sidebar-navigation></sidebar-navigation>

      <app-toolbar></app-toolbar>

      <v-content :style="`padding-bottom: ${footer_visible ? 44 : 20}px;`">
        <v-container class="no-padding" fluid fill-height align>
          <v-layout row align-space-between all fill-height>
            <sidebar-main fill-height></sidebar-main>
            <v-flex :xs10="is_sidebar_open" :xs12="!is_sidebar_open" style="padding-left: 0.5em;">
              <editor-shell-tab-system></editor-shell-tab-system>
              <editor-shell-content-manager></editor-shell-content-manager>
              <plugin-install-main v-if="this.$store.state.Plugins.is_menu_open"></plugin-install-main>
              <window-factory-main></window-factory-main>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>

      <v-footer :class="footer_visible ? 'big' : ''" fixed app>
        <footer-main></footer-main>
        <v-spacer></v-spacer>
        <v-divider v-if="footer_visible" vertical></v-divider>
        <span style="padding: 0 1em; white-space: nowrap;">created by solvedDev</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  import AppToolbar from "@/components/AppToolbar";
  import SidebarNavigation from "@/components/sidebar/Navigation";
  import SidebarMain from "@/components/sidebar/Main";
  import EditorShellTabSystem from "@/components/editor_shell/TabSystem";
  import EditorShellContentManager from "@/components/editor_shell/ContentManager";
  import PluginInstallMain from "@/components/plugin_install/Main";
  import WindowFactoryMain from "@/components/windowFactory/Main";
  import FooterMain from "@/components/footer/Main";

  import UpdateWindow from "./windows/UpdateApp";
  import SETTINGS from "./store/Settings";

  export default {
    name: 'bridge',
    components: {
      AppToolbar,
      SidebarNavigation,
      SidebarMain,
      EditorShellTabSystem,
      EditorShellContentManager,
      PluginInstallMain,
      WindowFactoryMain,
      FooterMain
    },
    created() {
      SETTINGS.setup();
    },
    mounted() {
      setTimeout(() => new UpdateWindow(), 1000);
    },
    computed: {
      is_sidebar_open() {
        return this.$store.state.SidebarMenu.menu_state > 0;
      },
      footer_visible() {
        return this.$store.state.Footer.elements.length > 0;
      }
    },
    data() {
      return {
        content: "",
        file: "",
        path: ""
      };
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  @import url('https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css');

  /* Global CSS */
  html {
    overflow: hidden;
  }
  body {
    overflow: unset;
  }

  /* SCROLLBAR */
  *::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  *::-webkit-scrollbar-track {
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
  }
  *::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.35);
    box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.4);
  }

  /* NO TEXT SELECTION */
  :root {
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* PADDING FIXES */
  aside {
    padding-top: 24px;
  }
  aside nav div.v-toolbar__content {
    padding: 0;
    padding-left: 0.5em;
  }
  .v-content .v-content__wrap > .container {
    padding-left: 0;
    padding-top: 0;
  }
</style>

<style scoped>
  .no-padding {
    padding: 0;
  }
  .v-footer {
    transition: all ease-in-out 200ms;
    height: 20px !important;
    min-height: 12px;
  }
  .v-footer.big {
    height: 44px !important;
  }
</style>
