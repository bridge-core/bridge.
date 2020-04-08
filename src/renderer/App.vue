<template>
	<v-app
		:style="{
			background: $vuetify.theme.themes[theme_variant].background,
			fontSize: $store.state.Settings.font_size || '16px',
		}"
	>
		<app-toolbar />
		<sidebar-navigation />

		<v-content :style="`padding-bottom: ${footer_visible ? 44 : 22}px;`">
			<v-row style="height: 100%;" no-gutters>
				<v-col v-if="is_sidebar_open" cols="2">
					<sidebar-main />
				</v-col>
				<v-col
					@click="setSplitScreen(false)"
					:style="
						`border-right: 1px solid ${
							is_dark_mode
								? 'rgba(255, 255, 255, 0.12)'
								: 'rgba(0, 0, 0, 0.12)'
						} !important;`
					"
					:cols="
						5 +
							5 * !has_split_screen +
							(1 + 1 * !has_split_screen) * !is_sidebar_open
					"
				>
					<editor-shell-tab-system />
					<editor-shell-content-manager />
				</v-col>
				<v-col
					@click="setSplitScreen(true)"
					v-if="has_split_screen"
					:cols="5 + 1 * !is_sidebar_open"
				>
					<editor-shell-tab-system :split_screen="true" />
					<editor-shell-content-manager :split_screen="true" />
				</v-col>
			</v-row>
		</v-content>

		<v-footer
			color="footer"
			:class="footer_visible ? 'big' : ''"
			fixed
			padless
			app
		>
			<footer-main></footer-main>
			<v-spacer></v-spacer>
			<v-divider v-if="footer_visible" vertical></v-divider>
			<span style="padding: 0 1em; white-space: nowrap;">
				created by
				<a class="grey--text text--lighten-1" @click="openTwitter"
					>solvedDev</a
				>
			</span>
		</v-footer>

		<window-factory-main />
		<context-menu-main />
		<json-editor-hover-card />
	</v-app>
</template>

<script>
import AppToolbar from '@/components/AppToolbar'
import SidebarNavigation from '@/components/sidebar/Navigation'
import SidebarMain from '@/components/sidebar/Main'
import EditorShellTabSystem from '@/components/editor_shell/TabSystem'
import JsonEditorHoverCard from '@/components/editor_shell/JsonEditor/HoverCard'
import EditorShellContentManager from '@/components/editor_shell/TabContentManager'
import WindowFactoryMain from '@/components/windowFactory/Main'
import FooterMain from '@/components/footer/Main'
import ContextMenuMain from '@/components/context_menu/Main'

import { shell } from 'electron'
import startUp from './scripts/Utilities/startUp'
import EventBus from './scripts/EventBus'
import Vue from 'vue'
import TabSystem from './scripts/TabSystem'
import './scripts/UserActions/DropFile'

export default {
	name: 'bridge',
	components: {
		AppToolbar,
		SidebarNavigation,
		SidebarMain,
		EditorShellTabSystem,
		EditorShellContentManager,
		WindowFactoryMain,
		FooterMain,
		ContextMenuMain,
		JsonEditorHoverCard,
	},
	async created() {
		this.$vuetify.theme.dark = this.$store.state.Appearance.is_dark_mode
		startUp()

		EventBus.on('bridge:applyTheme', theme => {
			if (theme === undefined || theme.definition === undefined) return
			const {
				light: { highlighter: highlighter_light, ...light },
				dark: { highlighter: highlighter_dark, ...dark },
			} = theme.definition

			Vue.set(
				this.$vuetify.theme.themes,
				'light',
				Object.assign(
					this.$vuetify.theme.themes.light,
					theme.definition.light || {}
				)
			)
			Vue.set(
				this.$vuetify.theme.themes,
				'dark',
				Object.assign(
					this.$vuetify.theme.themes.dark,
					theme.definition.dark || {}
				)
			)
			this.$store.commit('setColorTheme', {
				light: highlighter_light,
				dark: highlighter_dark,
				update_styles: theme.update_styles,
			})
		})
		EventBus.on('updateTabUI', this.updateSplitScreen)

		//Disable middle-mouse scrolling
		window.addEventListener('mousedown', event => {
			if (event.button === 1) event.preventDefault()
		})
	},
	mounted() {},
	computed: {
		is_sidebar_open() {
			return this.$store.state.SidebarMenu.menu_state > 0
		},
		footer_visible() {
			return this.$store.state.Footer.elements.length > 0
		},
		is_dark_mode() {
			return this.$store.state.Appearance.is_dark_mode
		},
		theme_variant() {
			return this.$vuetify.theme.dark ? 'dark' : 'light'
		},
		project_name() {
			return this.$store.state.Explorer.project.explorer
		},
	},
	watch: {
		is_dark_mode(to) {
			this.$vuetify.theme.dark = to
		},
		project_name(to) {
			document.head.getElementsByTagName('title')[0].innerText = `${
				to ? to + ' - ' : ''
			}bridge.`
		},
	},
	data() {
		return {
			content: '',
			file: '',
			path: '',
			has_split_screen: false,
		}
	},
	methods: {
		openTwitter() {
			shell.openExternal('https://twitter.com/solvedDev')
		},
		updateSplitScreen() {
			this.has_split_screen =
				TabSystem.getCurrentProjects(true).length > 0
		},
		setSplitScreen(val) {
			TabSystem.split_screen_active = val
		},
	},
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700');

/* Global CSS */
html {
	overflow: hidden;
	overscroll-behavior: contain;
}
body {
	overflow: unset;
}
textarea {
	outline: none;
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

v-application--wrap > main.v-content {
	padding-left: 60px !important;
}
.v-system-bar {
	padding-right: 0;
}
.v-system-bar .v-icon {
	margin: 0;
}

.json-input-suggestions .v-list-item,
.small-list .v-list-item {
	min-height: 28px !important;
}
.json-input-suggestions .v-list-item__content,
.small-list .v-list-item__content {
	padding: 4px 0 !important;
}

.v-list {
	background: var(--v-menu-base) !important;
	border-radius: 0px;
}
</style>

<style scoped>
.no-padding {
	padding: 0;
}
.v-footer {
	transition: all ease-in-out 200ms;
	height: 22px !important;
	min-height: 12px;
}
.v-footer.big {
	height: 44px !important;
}
</style>
