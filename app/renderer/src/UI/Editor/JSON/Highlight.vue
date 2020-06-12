<template>
	<component v-if="isOnScreen" :is="tagName">
		<Await :promise="colorize(value)">
			<template #default="{ data }">
				<span v-html="data" />
			</template>
			<template #pending>
				<span v-text="value" />
			</template>
			<template #error>
				<span v-text="value" />
			</template>
		</Await>
	</component>
	<component
		:is="tagName === 'summary' ? tagName : 'div'"
		v-else
		v-text="value"
	/>
</template>

<script>
import { editor, languages } from 'monaco-editor'
import Await from '../../Common/Await'

export default {
	name: 'Highlight',
	components: {
		Await,
	},
	props: {
		tagName: {
			default: 'span',
			type: String,
		},
		language: String,
		value: String,
		isOnScreen: {
			default: true,
			type: Boolean,
		},
	},
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
	},
	methods: {
		colorize(string) {
			return editor.colorize(string, this.language, {
				theme: this.isDarkMode ? 'bridge-dark' : 'bridge-light',
			})
		},
	},
}
</script>
