<template>
	<v-container v-if="!no_projects">
		<span
			v-if="
				selected !== undefined &&
					selected !== '/@NO-RP@/' &&
					selected !== '/@NO-DEPENDENCY@/' &&
					selected !== '/@NO-BP@/'
			"
		>
			<component
				:is="toolbar_component"
				:selected="selected"
				:base_path="base_path"
			/>
			<v-divider />
		</span>

		<v-layout align-center>
			<span style="padding: 0 4px;">
				<v-avatar tile size="36px">
					<img :src="project_icon" />
				</v-avatar>
			</span>

			<v-subheader
				v-if="selected"
				style="width: calc(100% - 48px);"
				v-ripple="force_project_algorithm === undefined"
				@click="openProjectScreen"
			>
				<span class="text-truncate">
					{{ selected.split(/\\|\//g).pop() }}
				</span>
				<template v-if="force_project_algorithm === undefined">
					<v-spacer />
					<v-icon small>mdi-menu-down</v-icon>
				</template>
			</v-subheader>
		</v-layout>

		<v-divider></v-divider>
		<file-displayer
			v-if="
				loaded_file_defs &&
					selected !== undefined &&
					selected !== '/@NO-RP@/' &&
					selected !== '/@NO-DEPENDENCY@/' &&
					selected !== '/@NO-BP@/'
			"
			:project="selected"
			:base_path="base_path"
			:explorer_type="explorer_type"
			class="file-displayer"
		/>
		<v-progress-linear
			v-else-if="!loaded_file_defs || selected === undefined"
			indeterminate
		/>
		<div v-else-if="selected === '/@NO-DEPENDENCY@/'" style="padding: 4px;">
			<p style="word-break: break-word;">
				It doesn't look like your current behavior pack has a
				corresponding resource pack registered inside its manifest file.
			</p>

			<v-btn @click="createRP" style="margin-right: 4px;">Create</v-btn>
			<v-btn color="primary" @click="linkRP">Link</v-btn>
		</div>
		<div v-else-if="selected === '/@NO-BP@/'" style="padding: 4px;">
			<p style="word-break: break-word;">
				Please load a behavior pack before trying to link a resource
				pack.
			</p>
		</div>
		<div v-else style="padding: 4px; word-break: break-word;">
			<p style="word-break: break-word;">
				The resource pack which belongs to this behavior pack does not
				exist.
			</p>
			<v-btn color="primary" @click="unlinkRP" style="margin-right: 4px;">
				<v-icon>mdi-lock-open</v-icon>Unlink
			</v-btn>
		</div>

		<v-divider />
	</v-container>
	<explorer-no-projects v-else />
</template>

<script>
import { ipcRenderer } from 'electron'
import FileDisplayer from './explorer/FileDisplayer.vue'
import ExplorerToolbar from './explorer/Toolbar.vue'
import ExplorerRpToolbar from './explorer/RpToolbar.vue'
import EventBus from '../../../EventBus'
import TabSystem from '../../../TabSystem'
import { BASE_PATH, BP_BASE_PATH, MOJANG_PATH } from '../../../constants'
import DataUrl from 'dataurl'
import fsync, { promises as fs } from 'fs'
import { LinkRP } from '../../Windows/LinkRP/definition'
import { CreateRP } from '../../Windows/Project/Create/definition'
import PackLinker from '../../../Utilities/LinkPacks'
import OmegaCache from '../../../editor/OmegaCache'
import ExplorerNoProjects from './explorer/NoProjects'
import PluginLoader from '../../../plugins/PluginLoader'
import LightningCache from '../../../editor/LightningCache'
import { JSONFileMasks } from '../../../editor/JSONFileMasks'
import LoadingWindow from '../../../../windows/LoadingWindow'
import FileType from '../../../editor/FileType'
import { setRP, trySetRP } from '../../../Utilities/FindRP'
import path from 'path'
import {
	ProjectChooser,
	LoadedProjects,
} from '../../Windows/Project/Chooser/definition'
import { loadProjects } from '../../Windows/Project/Chooser/load'
import { on } from '../../../AppCycle/EventSystem'

export default {
	name: 'content-explorer',
	components: {
		FileDisplayer,
		ExplorerToolbar,
		ExplorerRpToolbar,
		ExplorerNoProjects,
	},
	props: {
		load_plugins: Boolean,
		base_path: String,
		explorer_type: String,
		force_project_algorithm: Function,
		toolbar_component: {
			default: 'explorer-toolbar',
			type: String,
			validator(value) {
				return (
					['explorer-toolbar', 'explorer-rp-toolbar'].indexOf(
						value
					) !== -1
				)
			},
		},
	},
	data() {
		return {
			listeners: ['readDir', 'readProjects'],
			items: [],
			display_label: 'Loading...',
			project_select_size: window.innerWidth / 7.5,
			no_projects: false,
			loaded_file_defs: FileType.LIB_LOADED,
			disposable: null,
		}
	},
	mounted() {
		this.$root.$on('refreshExplorer', () =>
			EventBus.trigger('bridge:refreshExplorer')
		)
		EventBus.on('bridge:refreshExplorer', this.refresh)
		EventBus.on('bridge:selectProject', this.selectProject)
		EventBus.on('bridge:loadedFileDefs', this.onFileDefsLoaded)
		this.disposable = on('bridge:findDefaultPack', this.findDefaultProject)
		window.addEventListener('resize', this.onResize)

		this.findDefaultProject()
	},
	destroyed() {
		this.$root.$off('refreshExplorer')
		EventBus.off('bridge:refreshExplorer', this.refresh)
		EventBus.off('bridge:selectProject', this.selectProject)
		EventBus.off('bridge:loadedFileDefs', this.onFileDefsLoaded)
		this.disposable.dispose()
		window.removeEventListener('resize', this.onResize)
	},
	computed: {
		selected: {
			get() {
				return this.$store.state.Explorer.project[this.explorer_type]
			},
			async set(project) {
				if (project === undefined) return
				this.$store.commit('setExplorerProject', {
					store_key: this.explorer_type,
					project,
				})
				if (this.explorer_type === 'explorer') await trySetRP()

				this.loadDirectory(project)
				EventBus.trigger('updateTabUI')
				// EventBus.on("updateSelectedTab");
			},
		},
		loading() {
			return this.items.length == 0
		},

		project_items() {
			return this.items.map(p => ({
				text: p.split(/\\|\//g).pop(),
				value: p,
			}))
		},
		project_icon() {
			try {
				return DataUrl.convert({
					data: fsync.readFileSync(
						this.base_path + this.selected + '/pack_icon.png'
					),
					mimetype: `image/png`,
				})
			} catch (e) {
				return DataUrl.convert({
					data: fsync.readFileSync(
						__static + '/images/pack_icon.png'
					),
					mimetype: `image/png`,
				})
			}
		},
	},
	methods: {
		openProjectScreen() {
			if (this.force_project_algorithm === undefined)
				ProjectChooser.open()
		},
		async refresh(force_val) {
			if (this.force_project_algorithm) {
				if (force_val) this.selected = force_val
				console.log('[REFRESH RP] ' + this.selected)
				this.loadDirectory(this.selected, true)
			} else {
				try {
					await loadProjects()
					this.items = LoadedProjects.map(
						({ relativeProjectPath }) => relativeProjectPath
					)
				} catch (e) {
					this.items = []
				}

				this.no_projects = false
				console.log('[REFRESH BP] ' + this.selected)

				if (this.items.length === 0) {
					this.no_projects = true
				}
				this.loadDirectory(this.selected, true)
			}
		},

		selectProject(val) {
			this.loadDirectory(val, true)
		},
		onFileDefsLoaded() {
			this.loaded_file_defs = true
		},

		async loadDirectory(dir = this.selected, force_reload) {
			let lw = new LoadingWindow().show()
			if (this.explorer_type === 'explorer') {
				EventBus.trigger('bridge:changedProject')
				OmegaCache.init(dir)
				LightningCache.init()
				JSONFileMasks.resetMasks()
			}

			if (
				dir === undefined ||
				dir === '/@NO-RP@/' ||
				dir === '/@NO-DEPENDENCY@/' ||
				dir === '/@NO-BP@/'
			)
				return lw.close()
			if (dir !== this.selected) {
				this.selected = dir
				TabSystem.select(0)
				return lw.close()
			}

			if (this.load_plugins) {
				await PluginLoader.loadPlugins()
			}
			lw.close()
		},

		registerListener(event_name, func) {
			if (event_name && !this.listeners.includes(event_name)) {
				ipcRenderer.on(event_name, func)
				this.listeners.push(event_name)
			}
		},
		onResize() {
			this.project_select_size = window.innerWidth / 7.5
		},

		async findDefaultProject(force_refresh = false) {
			if (this.force_project_algorithm) {
				this.selected = undefined
				if (force_refresh) setRP(undefined)
				this.selected = await this.force_project_algorithm()
			} else {
				try {
					await loadProjects()
					this.items = LoadedProjects.map(
						({ relativeProjectPath }) => relativeProjectPath
					)
				} catch (e) {
					this.items = []
				}
				this.no_projects = false

				/**
				 * items[0] === "undefined":
				 *   Allows the no_projects screen to launch for users which didn't have a BP before the no_projects screen update
				 */
				if (
					this.items.length === 0 ||
					(this.items.length === 1 && this.items[0] === 'undefined')
				) {
					this.no_projects = true
				}
				this.selected = this.findDefaultBPProject()
			}
		},
		findDefaultBPProject() {
			if (this.$store.state.Settings.default_project === undefined)
				return this.items[0]

			for (let i = 0; i < this.items.length; i++) {
				if (
					this.items[i].toLowerCase() ===
					this.$store.state.Settings.default_project.toLowerCase()
				)
					return this.items[i]
			}
			return this.items[0]
		},

		linkRP() {
			LinkRP.open()
		},
		unlinkRP() {
			PackLinker.unlink(this.$store.state.Explorer.project.explorer)
		},
		createRP() {
			CreateRP.open()
		},
	},
}
</script>

<style scoped>
div.container {
	padding: 0;
}
</style>
