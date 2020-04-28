<template>
	<v-flex>
		<v-layout align-center>
			<v-text-field
				ref="input"
				@keydown.enter.native="click"
				:disabled="file_navigation === 'global'"
				v-if="type == 'edit'"
				v-model="value"
			/>
			<v-combobox
				ref="input"
				v-else
				v-model="value"
				@input="click"
				:label="label"
				:items="items"
				dense
				:menu-props="{
					maxHeight: 120,
					top: false,
					contentClass: 'json-input-suggestions',
				}"
				:hide-no-data="true"
				no-data-text="No suggestions available..."
				class="json-input-menu"
			></v-combobox>
			<v-btn
				style="margin-left: 4px;"
				color="default_button"
				@click="click"
				:disabled="type === 'edit' && file_navigation === 'global'"
			>
				<v-icon>mdi-plus</v-icon>
			</v-btn>
		</v-layout>
	</v-flex>
</template>

<script>
import TabSystem from '../../../scripts/TabSystem'
import JSONTree from '../../../scripts/editor/JsonTree'
import EventBus from '../../../scripts/EventBus'
import PluginEnv from '../../../scripts/plugins/PluginEnv'
import { JSONAction } from '../../../scripts/TabSystem/CommonHistory'

export default {
	name: 'json-input',
	props: {
		type: String,
		tab_id: Number,
		render_object: Object,
		file_navigation: String,
		current_file_path: String,
		is_active: Boolean,
	},
	data() {
		return {
			items: [],
			value: '',
			trigger_cooldown: false,
		}
	},
	mounted() {
		if (this.type == 'edit') {
			this.value = TabSystem.getCurrentNavContent()
			EventBus.on('updateFileNavigation', this.updateValue)
			EventBus.on('setWatcherInactive', () => {
				if (!this.is_active) return
				this.watcher_active = false
			})
		} else {
			this.updateAutoCompletions()
			EventBus.on('updateAutoCompletions', this.updateAutoCompletions)
		}
	},
	destroyed() {
		if (this.type == 'edit') {
			EventBus.off('updateFileNavigation', this.updateValue)
		} else {
			EventBus.off('updateAutoCompletions', this.updateAutoCompletions)
		}
	},
	watch: {
		file_navigation(nav) {
			if (this.type === 'edit') return
			this.updateAutoCompletions()
		},
		provide_auto_completions(prov_auto) {
			if (!prov_auto) this.items = []
			else this.updateAutoCompletions()
		},
	},
	computed: {
		label() {
			if (this.type == 'object') {
				return 'Add object'
			} else if (this.type == 'value') {
				return 'Add value'
			} else {
				return 'Edit'
			}
		},
		provide_auto_completions() {
			return this.$store.state.Settings.auto_completions
		},
	},
	methods: {
		click(val) {
			if (this.trigger_cooldown) return

			if (this.value === '')
				this.value = this.$refs.input.$el.querySelector('input').value
			if (this.value === '' || !this.value) return
			let current = this.render_object.get(this.file_navigation)
			let is_data_path = TabSystem.getSelected().content.isDataPath(
				this.file_navigation
			)
			if (this.type === 'object') {
				let node = new JSONTree(this.value + '')
				current.add(node, true)
				current.openNode()
				EventBus.trigger('setWatcherInactive')

				if (
					!current.meta.expand_path_exceptions ||
					!current.meta.expand_path_exceptions.includes(this.value)
				)
					this.expandPath(this.value)
				else this.updateAutoCompletions()
			} else if (
				this.file_navigation !== 'global' &&
				this.type === 'value'
			) {
				if (current.children.length > 0) return

				TabSystem.getHistory().add(
					new JSONAction('edit-data', current, current.data)
				)
				current.edit(this.value)
				this.navigationBack()

				if (
					current.parent !== undefined &&
					current.parent.propose().object.length === 0
				)
					this.navigationBack()

				//PLUGIN HOOK
				PluginEnv.trigger('bridge:modifiedNode', {
					node: current,
				})
			} else if (this.type === 'edit') {
				if (!is_data_path) {
					TabSystem.getHistory().add(
						new JSONAction('edit-key', current, current.key)
					)
					current.key = this.value
					current.updateUUID()
					TabSystem.setCurrentFileNav(current.path)
				} else {
					TabSystem.getHistory().add(
						new JSONAction('edit-data', current, current.data)
					)
					current.edit(this.value)
					TabSystem.setCurrentFileNav(
						current.path +
							'/' +
							this.value.replace(/\//g, '#;slash;#')
					)
				}

				//PLUGIN HOOK
				PluginEnv.trigger('bridge:modifiedNode', {
					node: current,
				})
			}
			TabSystem.setCurrentUnsaved()
			EventBus.trigger('updateCurrentContent')

			if (this.type !== 'edit') {
				this.$nextTick(() => {
					this.value = ''
					this.trigger_cooldown = false
				})
				this.trigger_cooldown = true
			}
		},

		updateAutoCompletions() {
			if (!this.is_active) return

			if (!this.provide_auto_completions) {
				this.items = []
				return
			}

			let current = this.render_object.get(this.file_navigation)
			if (current === undefined || current === null) return
			if (current.data !== '') return (this.items = [])

			//PLUGIN HOOK
			let propose = current.propose(this.file_navigation)
			PluginEnv.trigger('bridge:beforePropose', {
				propose,
				node: current,
			})
			this.items = propose[this.type]

			this.$nextTick(() => {
				if (this.items && this.items.length > 0 && this.$refs.input) {
					if (this.$store.state.Settings.auto_fill_inputs)
						this.value = this.items[0]
					if (
						this.$store.state.Settings.focus_json_inputs &&
						(this.type === 'object' || propose.object.length === 0)
					)
						this.$refs.input.focus()
				} else if (
					this.type === 'value' &&
					this.$store.state.Settings.focus_json_inputs &&
					current.meta.is_value
				) {
					this.$refs.input.focus()
				}
			})
		},

		expandPath(path) {
			TabSystem.setCurrentFileNav(
				`${TabSystem.getCurrentNavigation()}/${path}`
			)
		},
		updateValue() {
			if (!this.is_active) return
			this.watcher_active = false
			this.value = TabSystem.getCurrentNavContent()
		},
		navigationBack() {
			TabSystem.navigationBack()
			// console.log(this.items.length == 0, this.file_navigation != "global")
			// if(this.items.length == 0 && this.file_navigation != "global") {
			//     TabSystem.navigationBack();
			//     this.updateAutoCompletions()
			//     this.navigationBack();
			// }
		},
	},
}
</script>

<style scoped>
.v-btn {
	min-width: 0;
}
</style>
