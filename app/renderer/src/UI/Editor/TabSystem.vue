<template>
	<div
		v-if="has_tabs"
		:style="
			`display: inline-block; overflow-x: scroll; white-space: nowrap; width: 100%;`
		"
		class="tab-drag"
	>
		<draggable ghost-class="ghost" @end="onEnd">
			<v-tab
				v-for="(file, i) in open_files"
				:key="
					`${selected_project}-${i}-${unsaved.join()}-${
						file.content.isLoadingMetaData
					}`
				"
				:ripple="!isSelected(i)"
				:class="`tab ${isSelected(i) ? 'selected' : ''} sortable`"
				:style="
					`
                ${isInactiveAndSelected(i) ? 'opacity: 1;' : ''}
                display: inline-block;
                border-bottom: 2px solid var(--v-background-darken2);
                background: var(--v-background-darken1);
				max-width: unset;
            `
				"
				@click.native="selected_tab = i"
				@click.middle.native="closeTab(i)"
				@contextmenu.native="onContextMenu($event, i)"
			>
				<v-btn
					v-if="showDocButton(file.file_path)"
					:disabled="!isSelected(i)"
					color="primary"
					@click.stop="openDoc(file.file_path)"
					text
					icon
					small
				>
					<v-icon small>mdi-book-open-page-variant</v-icon>
				</v-btn>

				<v-tooltip
					v-if="file.content.isLoadingMetaData"
					color="tooltip"
					right
				>
					<template v-slot:activator="{ on }">
						<v-progress-circular
							v-on="on"
							indeterminate
							:size="14"
							:width="2"
							color="primary"
						/>
					</template>
					<span>Validating file...</span>
				</v-tooltip>

				<v-icon
					v-else-if="getIcon(file.file_path)"
					:color="isSelected(i) ? 'primary' : undefined"
					small
					>{{ getIcon(file.file_path) }}</v-icon
				>

				<span v-if="file.folders.length > 0">
					{{ file.folders[file.folders.length - 1] }}
					/
				</span>
				<v-tooltip
					color="tooltip"
					:open-delay="600"
					transition="scale-transition"
					:disabled="file.file_name.length <= 27"
					bottom
				>
					<template v-slot:activator="{ on }">
						<span
							v-on="on"
							:style="
								`font-style: ${unsaved[i] ? 'italic' : 'none'};`
							"
							>{{ getFileName(file.file_name) }}</span
						>
					</template>
					<span>{{ file.file_name }}</span>
				</v-tooltip>

				<v-btn @click.stop="closeTab(i)" text icon small>
					<v-icon small>mdi-close</v-icon>
				</v-btn>
			</v-tab>
		</draggable>
	</div>
</template>

<script>
import TabSystem from '../../TabSystem'
import EventBus from '../../EventBus'
import FileType from '../../editor/FileType'
import { shell } from 'electron'
import { DOC_URL } from '../../constants'
import { getTabContextMenu } from '../../UI/ContextMenu/Tab'
import draggable from 'vuedraggable'

export default {
	name: 'editor-shell-tab-system',
	props: {
		split_screen: {
			type: Boolean,
			default: false,
		},
	},
	components: {
		draggable,
	},
	data() {
		return {
			open_files: TabSystem.getCurrentProjects(this.split_screen),
			internal_selected_tab: TabSystem.getSelectedIndex(
				this.split_screen
			),
			unsaved: [],
			oldIndex: '',
			newIndex: '',
		}
	},
	created() {
		EventBus.on('updateTabUI', this.updateFiles)
		EventBus.on('updateSelectedTab', this.changeSelected)
		EventBus.on('updateSelectedTabUI', this.updateSavedUI)
	},
	destroyed() {
		EventBus.off('updateTabUI', this.updateFiles)
		EventBus.off('updateSelectedTab', this.changeSelected)
		EventBus.off('updateSelectedTabUI', this.updateSavedUI)
	},
	computed: {
		selected_project() {
			return this.$store.state.Explorer.project.explorer
		},
		selected_tab: {
			set(val = 0) {
				this.internal_selected_tab = val
				TabSystem.split_screen_active = this.split_screen
				TabSystem.select(val)
			},
			get() {
				return this.internal_selected_tab
			},
		},
		split_screen_active() {
			return this.$store.state.TabSystem.split_screen_active
		},
		render_open_files() {
			return TabSystem.getCurrentProjects(this.split_screen)
		},

		has_tabs() {
			return this.open_files.length > 0
		},
		is_dark_mode() {
			return this.$store.state.Appearance.is_dark_mode
		},
	},
	methods: {
		closeTab(i) {
			TabSystem.split_screen_active = this.split_screen
			TabSystem.closeById(i)
		},
		changeSelected() {
			this.internal_selected_tab = TabSystem.getSelectedIndex(
				this.split_screen
			)
		},
		updateFiles() {
			this.open_files = TabSystem.getCurrentProjects(this.split_screen)

			this.unsaved = this.open_files.map(f =>
				f.is_unsaved === undefined
					? false
					: f.is_unsaved && !f.is_immutable
			)
		},
		updateSavedUI() {
			this.unsaved = this.open_files.map(f =>
				f.is_unsaved === undefined
					? false
					: f.is_unsaved && !f.is_immutable
			)
		},
		getFileName(file_name) {
			return file_name.length > 27 && !file_name.includes(' ')
				? file_name.substr(0, 27) + '\u2026'
				: file_name
		},
		isSelected(i) {
			return (
				this.selected_tab === i &&
				(this.split_screen
					? this.split_screen_active
					: !this.split_screen_active)
			)
		},
		isInactiveAndSelected(i) {
			return (
				this.selected_tab === i &&
				!(this.split_screen
					? this.split_screen_active
					: !this.split_screen_active)
			)
		},

		showDocButton(file_path) {
			let file_data = FileType.getData(file_path) || {}
			return (
				file_data.file_viewer !== 'json' &&
				file_data.documentation !== undefined
			)
		},
		openDoc(file_path) {
			shell.openExternal(
				`${DOC_URL}${encodeURI(
					FileType.getData(file_path).documentation
				)}`
			)
		},
		getIcon(file_path) {
			return FileType.getFileIcon(file_path)
		},
		onEnd: function(evt) {
			this.oldIndex = evt.oldIndex
			this.newIndex = evt.newIndex
		},
		async onContextMenu(event, index) {
			this.$store.commit('openContextMenu', {
				x_position: event.clientX,
				y_position: event.clientY,
				menu: await getTabContextMenu(index),
			})
		},
	},
}
</script>

<style scoped>
div.flex {
	padding-bottom: 0 !important;
}

.tab {
	padding: 8px 16px;
	text-transform: none;
	opacity: 0.5;
}
.tab:hover {
	opacity: 1;
}
.tab.selected {
	opacity: 1;
	border-bottom: 2px solid var(--v-primary-base) !important;
	color: var(--v-primary-base);
}
*::-webkit-scrollbar-track {
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
}
*::-webkit-scrollbar-thumb {
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
}
.tab-drag .sortable-drag {
	opacity: 0;
}
/* .v-icon {
        margin-left: 0.1em;
        opacity: 0.4;
        transition: all ease-in-out 300ms;
    }
    .v-icon:hover {
        opacity: 1;
    } */
</style>
