<template>
	<div v-if="open_files.length > 0">
		<span
			v-for="(file, i) in open_files"
			:key="`file-${selected_project}-${file.uuid}-${i}`"
		>
			<file-manager
				v-if="selected_tab == i"
				:file="file"
				:available_height="available_height - 10"
				:tab_id="i"
				:is_active="
					$store.state.TabSystem.split_screen_active
						? split_screen
						: !split_screen
				"
				:uuid="`(${selected_project}-${i}`"
			></file-manager>
		</span>
	</div>
	<welcome-screen
		:available_height="available_height + 42"
		v-else
	></welcome-screen>
</template>

<script>
import FileManager from './SingleFile'
import WelcomeScreen from './WelcomeScreen'
import TabSystem from '../../TabSystem'
import EventBus from '../../EventBus'

export default {
	name: 'editor-shell-content-manager',
	props: {
		split_screen: {
			type: Boolean,
			default: false,
		},
	},
	components: {
		WelcomeScreen,
		FileManager,
	},
	created() {
		window.addEventListener('resize', this.onResize)
		EventBus.on('updateTabUI', this.setOpenFiles)
		EventBus.on('updateSelectedTab', this.updateSelectedTab)
	},
	destroyed() {
		window.removeEventListener('resize', this.onResize)
		EventBus.off('updateTabUI', this.setOpenFiles)
		EventBus.off('updateSelectedTab', this.updateSelectedTab)
	},
	data() {
		return {
			available_height: window.innerHeight - 92,
			open_files: TabSystem.getCurrentProjects(this.split_screen),
			selected_tab: TabSystem.getSelectedIndex(this.split_screen),
		}
	},
	methods: {
		onResize() {
			this.available_height = window.innerHeight - this.base_height
		},
		setOpenFiles() {
			this.open_files = TabSystem.getCurrentProjects(this.split_screen)
		},
		updateSelectedTab() {
			EventBus.trigger('bridge:closeTextCompletions')
			this.selected_tab = TabSystem.getSelectedIndex(this.split_screen)
		},
	},
	computed: {
		// open_files() {
		//     return this.$store.getters.open_files();
		// },
		// selected_tab() {
		//     return this.$store.state.TabSystem.getSelectedIndex(this.split_screen)_tab;
		// },
		base_height() {
			return 108
		},
		selected_project() {
			return this.$store.state.Explorer.project.explorer
		},
	},
	watch: {
		base_height(to) {
			this.available_height = window.innerHeight - to
		},
	},
}
</script>
