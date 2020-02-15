<template>
	<span
		:class="class_name"
		:style="as_block ? 'display: block;' : ''"
		@click.stop="attrClick"
	>
		<highlight-text v-if="use_advanced_parsing">{{ text }}</highlight-text>
		<span v-else @click.stop="event => $emit('click', event)">{{
			text
		}}</span>

		<v-tooltip
			v-if="meta.is_molang && text !== '' && !is_immutable"
			color="primary"
			right
		>
			<template v-slot:activator="{ on }">
				<v-btn
					v-on="on"
					color="primary"
					style="margin: 0; margin-left: 4px; height: 20px; width: 20px;"
					text
					small
					icon
					@click="editMoLang"
				>
					<v-icon small>mdi-pencil</v-icon>
				</v-btn>
			</template>

			<span>Edit</span>
		</v-tooltip>

		<color-picker
			v-if="is_color"
			:node_context="node_context"
			:is_immutable="is_immutable"
		/>
	</span>
</template>

<script>
import HighlightText from './HighlightText'
import EditMoLangWindow from '../../../windows/EditMoLang'
import ColorPicker from './ColorPicker'

export default {
	name: 'highlight-attribute',
	props: {
		data: [String, Boolean, Number],
		meta: {
			type: Object,
			default: () => ({}),
		},
		node_context: Object,
		as_block: {
			default: true,
			type: Boolean,
		},
		is_immutable: {
			default: false,
			type: Boolean,
		},
	},
	components: {
		HighlightText,
		ColorPicker,
	},
	computed: {
		is_color() {
			return this.data[0] === '#' && this.data.length === 7
		},
		text() {
			if (this.data != undefined) return (this.data + '').trim()
			return this.data
		},
		class_name() {
			if (
				this.text === 'true' ||
				this.text === 'false' ||
				this.text === 'null'
			) {
				return 'cm-atom'
			} else if (isNaN(this.text)) {
				return 'cm-string'
			} else {
				return 'cm-number'
			}
		},
		use_advanced_parsing() {
			return (
				isNaN(this.text) &&
				!(
					this.text === 'true' ||
					this.text === 'false' ||
					this.text === 'undfined'
				) &&
				this.text.match(/:|<|>|\.|\s/g) != null
			)
		},

		is_dark_mode() {
			return this.$store.state.Appearance.is_dark_mode
		},
		color_theme() {
			return this.is_dark_mode
				? this.$store.state.Appearance.color_theme.dark
				: this.$store.state.Appearance.color_theme.light
		},
	},
	methods: {
		editMoLang() {
			new EditMoLangWindow(this.text, this.node_context)
		},
		attrClick(event) {
			if (
				event.target.tagName === 'I' ||
				event.target.tagName === 'BUTTON' ||
				event.target.tagName === 'DIV'
			)
				return

			this.$emit('click', event)
		},
	},
}
</script>
