<template>
	<v-menu
		v-model="is_visible"
		:close-on-content-click="false"
		:position-x="x_position"
		:position-y="y_position"
		transition="slide-y-transition"
	>
		<v-card color="background">
			<v-card-text>
				<pre>{{
					data.slice(0, 200) + (data.length > 200 ? '...' : '')
				}}</pre>
			</v-card-text>
			<v-divider />

			<v-text-field
				v-if="!isImmutable"
				solo
				background-color="background"
				v-model="current_comment"
				@input="updateComment"
				label="Click to add a comment"
				prepend-inner-icon="mdi-pencil"
				hide-details
				style="margin: 4px 0px;"
			/>
			<v-divider v-if="!isImmutable" />

			<v-card-actions>
				<template v-for="(btn, i) in filteredButtons">
					<v-spacer v-if="btn === 'space'" :key="i" />
					<v-tooltip
						v-else-if="
							btn.condition === undefined || btn.condition()
						"
						:key="i"
						bottom
						:color="btn.color || 'tooltip_color'"
					>
						<template v-slot:activator="{ on }">
							<v-btn
								v-on="on"
								:color="btn.color"
								:style="
									`margin-right: ${
										i + 1 <= buttons.length ? 4 : 0
									}px; min-width: 30px; padding: 0;`
								"
								small
								@click="btn.action"
							>
								<v-icon
									style="font-family: Roboto;"
									:color="btn.color ? 'white' : undefined"
									>{{ btn.icon }}</v-icon
								>
							</v-btn>
						</template>

						<span>{{ btn.title }}</span>
					</v-tooltip>
				</template>
			</v-card-actions>
		</v-card>
	</v-menu>
</template>

<script>
import TabSystem from '../../../TabSystem'
import FileSystem from '../../../FileSystem'
import { clipboard, shell } from 'electron'
import { JSONAction } from '../../../TabSystem/CommonHistory'
import EventBus from '../../../EventBus'
import NodeShortcuts from '../../../editor/NodeShortcuts'
import JumpToDefintion from '../../../editor/JumpToDef'
import { openDocumentation } from '../../../editor/Documentation'
import { createInformationWindow } from '../../Windows/Common/CommonDefinitions'

export default {
	name: 'json-editor-hover-card',
	data() {
		return {
			current_comment: '',
			buttons: [
				{
					title: 'Ignore Error',
					color: 'indigo',
					mutatesFile: true,
					condition: () => {
						let c = TabSystem.getCurrentNavObj()
						return (
							c &&
							c.error !== undefined &&
							c.meta.ignore_error === undefined
						)
					},
					icon: 'mdi-cancel',
					action: () => {
						this.is_visible = false

						let c = TabSystem.getCurrentNavObj()
						c.meta.ignore_error = true
						c.updateUUID()
					},
				},
				{
					title: 'Reveal Error',
					color: 'indigo lighten-2',
					mutatesFile: true,
					condition: () => {
						let c = TabSystem.getCurrentNavObj()
						return (
							c &&
							c.error !== undefined &&
							c.meta.ignore_error !== undefined
						)
					},
					icon: 'mdi-check',
					action: () => {
						this.is_visible = false

						let c = TabSystem.getCurrentNavObj()
						delete c.meta.ignore_error
						c.updateUUID()
					},
				},
				{
					title: 'Documentation',
					icon: 'mdi-book-open-page-variant',
					color: 'indigo',
					action: () => {
						this.is_visible = false
						openDocumentation(TabSystem.getCurrentNavObj().key)
					},
				},
				{
					title: 'Jump To Definition',
					icon: 'mdi-code-braces',
					color: 'indigo',
					condition: () => {
						let c = TabSystem.getCurrentNavObj()
						if (!c || !c.meta.definitions || c.data === '')
							return false

						let open = JumpToDefintion.fetchSync(
							c.meta.definitions,
							c.data
						)
						if (open.length === 0) return false

						for (let f of open) {
							if (!TabSystem.isSelected(f)) return true
						}
						return false
					},
					action: async () => {
						this.is_visible = false
						let c = TabSystem.getCurrentNavObj()
						const open = await JumpToDefintion.fetch(
							c.meta.definitions,
							c.data
						)
						if (open.length === 0)
							createInformationWindow(
								'Definition Not Found',
								`Unable to find ${definitions.join(
									'/'
								)} definition "${fetch_data}".`
							)
						else open.forEach(f => FileSystem.open(f))
					},
				},
				'space',
				{
					title: 'Move Down',
					icon: 'mdi-chevron-down',
					color: 'secondary',
					mutatesFile: true,
					action: () => TabSystem.moveCurrentDown(),
				},
				{
					title: 'Move Up',
					icon: 'mdi-chevron-up',
					color: 'secondary',
					mutatesFile: true,
					action: () => TabSystem.moveCurrentUp(),
				},
				{
					title: 'Copy',
					icon: 'mdi-content-copy',
					color: 'success',
					action: () => {
						this.is_visible = false

						NodeShortcuts.copy()
					},
				},
				{
					title: 'Cut',
					icon: 'mdi-content-cut',
					color: 'success',
					mutatesFile: true,
					action: () => {
						this.is_visible = false

						NodeShortcuts.cut()
					},
				},
				{
					title: 'Paste',
					icon: 'mdi-download',
					color: 'success',
					mutatesFile: true,
					action: () => {
						this.is_visible = false

						NodeShortcuts.paste()
					},
				},
				{
					title: 'Comment/Uncomment',
					icon: '//',
					color: 'warning',
					mutatesFile: true,
					action: () => {
						try {
							TabSystem.getCurrentNavObj().toggleIsActive()
							TabSystem.setCurrentUnsaved()
						} catch {}
						this.is_visible = false
					},
				},
				{
					title: 'Delete',
					icon: 'mdi-delete',
					color: 'error',
					mutatesFile: true,
					action: () => {
						this.is_visible = false
						TabSystem.deleteCurrent()
					},
				},
			],
		}
	},
	computed: {
		data() {
			return this.$store.state.EditorHover.data
		},
		is_visible: {
			get() {
				this.updateCurrentComment()
				return this.$store.state.EditorHover.is_visible
			},
			set() {
				this.$store.commit('hideEditorHoverCard')
			},
		},
		x_position() {
			return this.$store.state.EditorHover.x_position
		},
		y_position() {
			return this.$store.state.EditorHover.y_position
		},
		isImmutable() {
			return this.$store.state.EditorHover.isImmutable
		},
		filteredButtons() {
			if (!this.isImmutable) return this.buttons
			return this.buttons.filter(({ mutatesFile }) => !mutatesFile)
		},
	},
	methods: {
		updateComment(val) {
			TabSystem.getCurrentNavObj().comment = val
			TabSystem.setCurrentUnsaved()
		},
		updateCurrentComment() {
			this.$nextTick(() => {
				try {
					this.current_comment = TabSystem.getCurrentNavObj().comment
				} catch (e) {
					/*console.log(e)*/
				}
			})
		},
	},
}
</script>

<style scoped>
pre {
	font-family: 'Roboto', sans-serif !important;
}
</style>
