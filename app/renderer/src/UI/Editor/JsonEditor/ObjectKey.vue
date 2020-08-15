<template>
	<summary
		@contextmenu="openContextMenu"
		:class="selected_class"
		@keydown.enter="openCurrent"
		:id="'summary.' + object_key"
		@click="event => $emit('mainClick', event)"
		@dblclick="
			event =>
				$store.state.Settings.cade_node_click
					? $emit('arrowClick', event)
					: undefined
		"
	>
		<!-- OPEN/CLOSE ARROW DISPLAY -->
		<v-btn
			icon
			small
			style="margin: 0; height: 16px; width: 16px;"
			@click="event => $emit('arrowClick', event)"
		>
			<v-icon v-if="node_context.open" small>mdi-chevron-down</v-icon>
			<v-icon v-else small>mdi-chevron-right</v-icon>
		</v-btn>

		<!-- KEY DISPLAY ERROR -->
		<v-tooltip
			v-if="
				$store.state.Settings.run_error_detection &&
					error &&
					error.show &&
					!node_context.meta.ignore_error &&
					!is_immutable
			"
			:open-delay="1400"
			right
			:nudge-right="error.fix ? 12 : 0"
			:color="error.isWarning ? 'amber darken-2' : 'error'"
		>
			<template v-slot:activator="{ on }">
				<span v-on="on">
					<highlight-text
						:style="
							`background: ${(
								node_context.mark_color || 'none'
							).replace(/;|:/g, '')};`
						"
						:class="
							`object ${
								error.isWarning ? 'warning-line' : 'error-line'
							}`
						"
						>{{ node_context.key }}</highlight-text
					>
				</span>
			</template>

			<span>{{ error.message }}</span>
		</v-tooltip>
		<!-- KEY DISPLAY NO ERROR -->
		<highlight-text
			v-else
			:style="
				`background: ${(node_context.mark_color || 'none').replace(
					/;|:/g,
					''
				)};`
			"
			class="object"
			>{{ node_context.key }}</highlight-text
		>

		<!-- DATA DISPLAY -->
		<span
			v-if="
				node_context.data !== '' &&
					!node_context.open &&
					!$store.state.Settings.hide_data_next_to_nodes
			"
		>
			:
			<highlight-attribute
				:data="node_context.data"
				:as_block="false"
				:meta="node_context.meta"
				:node_context="node_context"
				:is_immutable="is_immutable"
				@click="onDataClick"
				@dblclick.native="
					event =>
						$store.state.Settings.cade_node_click
							? $emit('arrowClick', event)
							: undefined
				"
			/>
		</span>

		<!-- ERROR PARENT CIRCLE -->
		<v-icon
			v-if="
				$store.state.Settings.run_error_detection &&
					$store.state.Settings.error_icon_indicator &&
					child_contains_error &&
					!node_context.open &&
					!is_immutable
			"
			color="error"
			small
			>mdi-alert-circle</v-icon
		>

		<!-- ERROR FIX -->
		<v-tooltip
			v-if="
				$store.state.Settings.run_error_detection &&
					$store.state.Settings.error_auto_fix &&
					error &&
					error.fix &&
					!node_context.meta.ignore_error &&
					!is_immutable
			"
			color="amber darken-2"
			right
		>
			<template v-slot:activator="{ on }">
				<v-btn
					v-on="on"
					color="amber darken-1"
					@click="fixError"
					style="margin: 0; height: 20px; width: 20px;"
					text
					small
					icon
				>
					<v-icon small>mdi-lightbulb</v-icon>
				</v-btn>
			</template>

			<span>{{ error.fix.text || 'Auto-fix' }}</span>
		</v-tooltip>

		<span
			v-if="show_comment && comment != ''"
			class="comment"
			:style="color_theme.comment"
			>//{{ comment }}</span
		>
	</summary>
</template>

<script>
import Main from './Main'
import HighlightText from './HighlightText'
import HighlightAttribute from './HighlightAttribute'
import TabSystem from '../../../TabSystem'
import { run, runFunction } from '../../../editor/ScriptRunner/run'
import { ENV } from '../../../editor/ScriptRunner/Validation/ENV'

export default {
	name: 'object-key',
	components: {
		Main,
		HighlightText,
		HighlightAttribute,
	},
	props: {
		object_key: String,
		node_context: Object,
		is_immutable: Boolean,
		show_comment: {
			default: true,
			type: Boolean,
		},
		is_active: Boolean,
	},
	computed: {
		selected_class() {
			if (
				this.$el &&
				this.is_selected() &&
				this.$store.state.Settings.auto_scroll_json
			)
				this.$el.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest',
				})
			return this.is_selected() && this.is_active ? 'selected' : ''
		},
		inversed_arrows() {
			return this.$store.state.Settings.inversed_arrows
		},

		is_dark_mode() {
			return this.$store.state.Appearance.is_dark_mode
		},
		color_theme() {
			return this.is_dark_mode
				? this.$store.state.Appearance.color_theme.dark
				: this.$store.state.Appearance.color_theme.light
		},
		error() {
			return this.node_context.error
		},
		child_contains_error() {
			return this.node_context.child_contains_error
		},
		comment() {
			return this.node_context.comment || ''
		},
	},
	methods: {
		onDataClick() {
			this.node_context.openNode()
			TabSystem.setCurrentFileNav(
				`${this.node_context.path}/${this.node_context.data}`
			)
			this.$nextTick(() => {
				const input = document.getElementById('json-editing-input')
				if (input) input.focus()
			})
		},
		fixError() {
			if (typeof this.error.fix.run === 'string')
				run(this.error.fix.run, ENV([], this.node_context))
			else runFunction(this.error.fix.run, ENV([], this.node_context))
		},
		is_selected() {
			return TabSystem.getCurrentNavigation() === this.object_key
			//return this.$store.getters.current_internal_file_path() == this.object_key;
		},
		openCurrent() {
			this.$root.$emit(`load(${this.tab_id}):${this.object_key}`)
		},
		openContextMenu(event) {
			TabSystem.setCurrentFileNav(this.object_key)
			let data
			if (Number.isNaN(Number(this.node_context.key)))
				data = `"${this.node_context.key}": ${JSON.stringify(
					this.node_context.toJSON(),
					null,
					'\t'
				)}`
			else data = JSON.stringify(this.node_context.toJSON(), null, '\t')

			this.$store.commit('showEditorHoverCard', {
				data,
				x_position: event.clientX,
				y_position: event.clientY,
				isImmutable: this.is_immutable,
			})
		},
	},
}
</script>

<style scoped>
summary {
	outline: none;
	cursor: pointer;
	transition: all ease-in-out 0.1s;
}
summary.selected {
	font-style: italic;
	background: rgba(119, 119, 119, 0.1);
}

span.key {
	padding-left: 0.75em;
}
span.comment {
	padding-left: 2em;
	font-style: normal;
}

summary::-webkit-details-marker {
	display: none;
}

.error-line {
	border-bottom: 2px dotted #f44336;
}
.warning-line {
	border-bottom: 2px dotted #ffa000;
}
button i {
	position: relative;
	bottom: 4px;
}
</style>
