<template>
	<div
		v-if="first || tree.open"
		v-intersect="onIntersect"
		style="margin-left: 16px;"
	>
		<template v-for="child in tree.children">
			<details
				v-if="child.children.length > 0"
				:key="`darkMode-${isDarkMode}-uuid-${child.uuid}`"
				:open="child.open"
			>
				<Highlight
					tagName="summary"
					:language="language"
					:value="child.key"
					:isOnScreen="isParentOnScreen && isOnScreen"
					@click.native="openTree($event, child)"
				/>

				<TreeRenderer
					:first="false"
					:language="language"
					:tree="child"
					:isParentOnScreen="isOnScreen"
				/>
			</details>

			<Highlight
				v-else
				:key="`darkMode-${isDarkMode}-uuid-${child.uuid}`"
				:language="language"
				:value="`${child.key} : ${transformData(child.data) || '{}'}`"
				:isOnScreen="isParentOnScreen && isOnScreen"
			/>
		</template>
	</div>
</template>

<script>
import Await from '../../Common/Await'
import Highlight from './Highlight.vue'
import JSONTree from '../../../editor/JsonTree'
import { editor } from 'monaco-editor'
import debounce from 'lodash.debounce'

let fakeEditor = null
export default {
	name: 'TreeRenderer',
	components: {
		Highlight,
	},
	props: {
		first: {
			default: true,
			type: Boolean,
		},
		tree: JSONTree,
		language: {
			required: true,
			type: String,
		},
		isParentOnScreen: {
			default: true,
			type: Boolean,
		},
	},
	created() {
		if (this.first || fakeEditor) return

		// We need to initialize a fake editor because of this GitHub issue:
		// https://github.com/microsoft/monaco-editor/issues/1948
		fakeEditor = editor.create(document.createElement('div'), {
			model: null,
		})
		editor.setTheme(this.isDarkMode ? 'bridge-dark' : 'bridge-light')
	},
	destroyed() {
		if (!this.first) return

		if (fakeEditor) fakeEditor.dispose()
		fakeEditor = null
	},

	data: () => ({
		isOnScreen: false,
	}),
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
	},
	methods: {
		transformData(data) {
			if (data === '') return data
			if (!Number.isNaN(Number(data))) return data
			if (data === 'true' || data === 'false') return data
			return `"${data}"`
		},
		onIntersect(entries) {
			debounce(() => (this.isOnScreen = entries[0].isIntersecting), 200)()
			// this.isOnScreen = entries[0].isIntersecting
		},
		openTree(event, tree) {
			event.stopPropagation()
			event.preventDefault()
			tree.toggleOpen()
		},
	},
	watch: {
		isDarkMode(value) {
			fakeEditor = null
			editor.setTheme(value ? 'bridge-dark' : 'bridge-light')
		},
	},
}
</script>
