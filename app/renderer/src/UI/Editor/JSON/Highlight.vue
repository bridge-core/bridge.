<template>
	<component v-if="shouldRender" :is="tagName">
		<Await
			@load="$emit('load')"
			@error="$emit('error')"
			:promise="colorize(value)"
		>
			<template #default="{ data }">
				<span v-html="data" />
			</template>
			<template #error>
				<span v-text="value" />
			</template>
		</Await>
	</component>
	<component
		:is="tagName === 'summary' ? tagName : 'span'"
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
	beforeDestroy() {
		clearTimeout(this.timeoutId)
	},

	data() {
		return {
			shouldRender: this.isOnScreen,
			timeoutId: null,
		}
	},
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
	},
	methods: {
		colorize(string) {
			// It looks like editor.colorize(...) calls are too expensive.
			// We need to collect requests to the web worker and send them together
			// return Promise.resolve(string)

			return editor
				.colorize(string, this.language, {
					theme: this.isDarkMode ? 'bridge-dark' : 'bridge-light',
				})
				.then(htmlString =>
					htmlString.substring(0, htmlString.length - 5)
				)
		},
	},
	watch: {
		isOnScreen(isOnScreen) {
			if (isOnScreen) {
				this.shouldRender = true
				if (this.timeoutId) clearTimeout(this.timeoutId)
			} else {
				this.timeoutId = setTimeout(() => {
					this.shouldRender = false
					this.timeoutId = null
				}, 3000)
			}
		},
	},
}
</script>
