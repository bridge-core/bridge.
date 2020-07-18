<template>
	<!-- TEXT -->
	<pre
		v-if="content.type == 'text' || content.type == undefined"
		:class="
			`${pre_color} ${content.action != undefined ? 'click-action' : ''}`
		"
		@click.stop="action.default"
		:style="{
			overflowX: 'auto',
			fontSize: $store.state.Settings.ui_font_size || '14px',
			fontFamily:
				$store.state.Settings.ui_font_family || 'Roboto, sans-serif',
		}"
		>{{ content.text }}</pre
	>
	<div
		v-else-if="content.type == 'html-text'"
		v-html="`${content.text}`"
	></div>
	<v-subheader v-else-if="content.type == 'header'" :color="content.color">
		{{ content.text }}
	</v-subheader>
	<h3 v-else-if="content.type == 'big-header'" :class="pre_color">
		{{ content.text }}
	</h3>
	<v-img
		v-else-if="content.type == 'img'"
		:src="content.src"
		:height="content.height"
	>
		<v-container v-if="content.content !== undefined" fill-height fluid>
			<v-layout fill-height>
				<v-flex xs12 align-end flexbox>
					<window-content
						v-for="c in content.content"
						:content="c"
						:key="key(c)"
					/>
				</v-flex>
			</v-layout>
		</v-container>
	</v-img>

	<!-- GENERAL -->
	<v-spacer v-else-if="content.type == 'space'" />
	<v-divider v-else-if="content.type == 'divider'" />
	<div
		v-else-if="content.type == 'container'"
		:style="
			`background-color: ${content.color}; padding: 4px; width: ${
				content.full_width ? '100%' : 'unset'
			}; height: ${content.height}px; overflow-y: ${
				content.scroll ? 'auto' : 'hidden'
			}; white-space: ${
				content.no_wrap ? 'nowrap' : 'unset'
			}; overflow-x: auto; height: ${content.height || 'unset'};`
		"
		:class="content.small_scrollbar ? 'small-scrollbar' : ''"
	>
		<window-content
			:style="content.display ? `display: ${content.display};` : ''"
			v-for="c in content.content"
			:key="key(c)"
			:content="c"
		/>
	</div>
	<v-chip
		v-else-if="content.type == 'tag'"
		:color="content.color"
		@click.stop="action.default"
		style="margin-right: 4px;"
		small
	>
		<v-icon class="click-action" v-if="content.icon" left>
			{{ content.icon }}
		</v-icon>
		{{ content.text }}
	</v-chip>
	<!-- HORIZONTAL GROUPS -->
	<v-layout
		:align-end="!content.center"
		:align-center="content.center"
		v-else-if="
			content.type == 'horizontal' && Array.isArray(content.content)
		"
	>
		<v-flex v-for="c in content.content" :key="key(c)">
			<window-content :content="c" />
		</v-flex>
	</v-layout>
	<v-layout v-else-if="content.type == 'horizontal' && content.content">
		<v-flex>
			<window-content :content="content.content" />
		</v-flex>
	</v-layout>
	<!-- CARDS -->
	<v-card
		v-else-if="content.type == 'card'"
		:color="content.color || 'background'"
		:tile="content.is_tiled"
		:elevation="content.elevation"
	>
		<v-card-title v-if="content.above_content">
			<window-content
				v-for="a_c in content.above_content"
				:key="key(a_c)"
				:content="a_c"
			/>
		</v-card-title>

		<v-card-text v-if="content.content">
			<window-content
				v-for="c in content.content"
				:key="key(c)"
				:content="c"
			/>
		</v-card-text>

		<v-card-actions v-if="content.below_content">
			<window-content
				v-for="b_c in content.below_content"
				:key="key(b_c)"
				:content="b_c"
			/>
		</v-card-actions>
	</v-card>
	<!-- LOADER -->
	<v-progress-linear
		v-else-if="content.type == 'loader' && !content.is_circular"
		:color="content.color"
		indeterminate
	/>
	<v-layout justify-center v-else-if="content.type == 'loader'">
		<v-progress-circular indeterminate :color="content.color" />
	</v-layout>

	<!-- BUTTONS -->
	<v-overflow-btn
		v-else-if="content.type == 'button-select'"
		:items="content.options"
		:label="content.text"
		:color="content.color || 'default_button'"
		segmented
	/>
	<v-btn
		v-else-if="content.type == 'button'"
		@click.stop.native="action.default"
		:color="content.color || 'default_button'"
		:rounded="content.is_rounded"
		:text="content.is_flat"
		:block="content.is_block"
		:disabled="content.is_disabled"
		:loading="content.is_loading"
	>
		<v-icon
			v-if="content.icon"
			class="click-action"
			:color="content.text_color"
			>{{ content.icon }}</v-icon
		>
		<span :class="text_color">{{ content.text }}</span>
	</v-btn>
	<v-btn
		v-else-if="content.type == 'icon-button'"
		@click.stop.native="action.default"
		:color="
			content.color || (!content.only_icon ? 'default_button' : undefined)
		"
		:rounded="content.is_rounded"
		:text="content.is_flat"
		:disabled="content.is_disabled"
		:icon="content.only_icon"
	>
		<v-icon :small="content.small" class="click-action">
			{{ content.text }}
		</v-icon>
	</v-btn>
	<v-icon
		v-else-if="content.type == 'icon' && !content.tooltip"
		@click.stop.native="action.default"
		:color="content.color"
		:class="content.action != undefined ? 'click-action' : ''"
		:small="content.small"
		>{{ content.text }}</v-icon
	>
	<v-tooltip
		v-else-if="content.type === 'icon'"
		right
		:color="content.color"
		:disabled="!content.tooltip"
	>
		<template v-slot:activator="{ on }">
			<v-icon
				v-on="on"
				@click.stop.native="action.default"
				:color="content.color"
				:class="content.action != undefined ? 'click-action' : ''"
				:small="content.small"
				>{{ content.text }}</v-icon
			>
		</template>

		<span>{{ content.tooltip }}</span>
	</v-tooltip>

	<!-- INPUTS -->
	<v-text-field
		v-else-if="content.type == 'input'"
		@input="action.default"
		@keydown.enter.native="action.enter"
		:color="content.color"
		:label="content.text"
		:value="content.input"
		:autofocus="content.has_focus"
		hide-details
		style="margin-bottom: 1px;"
		ref="input"
	/>
	<v-textarea
		v-else-if="content.type == 'textarea'"
		@input="action.default"
		@keydown.enter.native="action.enter"
		:no-resize="!content.resizable"
		:color="content.color"
		:label="content.text"
		:value="content.input"
		:autofocus="content.has_focus"
		ref="input"
	></v-textarea>
	<v-switch
		v-else-if="content.type == 'switch'"
		@change="action.default"
		:label="content.text"
		:color="content.color"
		value
		:input-value="content.input"
	/>
	<v-select
		v-else-if="content.type == 'select'"
		:label="content.text"
		:items="content.options"
		@change="action.default"
		:color="content.color"
		background-color="menu"
		:value="content.input"
		:autofocus="content.has_focus"
		:menu-props="{ maxHeight: content.max_height }"
		solo
	/>
	<v-combobox
		v-else-if="content.type == 'combobox'"
		auto-select-first
		hide-no-data
		:label="content.text"
		:items="content.options"
		@change="action.default"
		@update:search-input="action.default"
		:value="content.input"
		:solo="content.is_box"
		:color="content.color"
		:background-color="content.is_box ? 'menu' : 'rgba(0, 0, 0, 0)'"
		:autofocus="content.has_focus"
		ref="input"
	/>
	<v-autocomplete
		v-else-if="content.type == 'autocomplete'"
		auto-select-first
		hide-no-data
		style="max-width: 99%;"
		dense
		:menu-props="{ maxHeight: 162 }"
		:label="content.text"
		:items="content.options"
		@change="action.default"
		:value="content.input"
		:solo="content.is_box"
		:color="content.color"
		:background-color="content.is_box ? 'menu' : 'rgba(0, 0, 0, 0)'"
		:autofocus="content.has_focus"
		ref="input"
	/>
	<v-color-picker
		v-else-if="content.type == 'color-picker'"
		:mode="content.mode || 'hexa'"
		:hide-mode-switch="true"
		@input="action.default"
		:value="content.input"
		:style="
			`border-radius: ${
				content.is_rounded === undefined || content.is_rounded
					? 'unset'
					: '0px'
			};`
		"
	/>
	<v-container style="width: 90%;" v-else-if="content.type == 'slider'">
		<v-slider
			@change="action.default"
			:label="content.text"
			:max="content.max"
			:min="content.min"
			:step="content.step"
			:value="content.input"
			thumb-label
			:color="content.color"
			:thumb-size="24"
		/>
	</v-container>
	<TextEditor
		v-else-if="content.type === 'monaco'"
		v-model="cm_content"
		:language="content.language"
		:disposeOnUnmount="true"
	/>

	<!-- ERROR -->
	<div v-else>
		<br />
		<strong class="error--text"
			>Invalid UI type: "{{ content.type }}"</strong
		>
	</div>
</template>

<script>
import EventBus from '../../../EventBus'
import uuidv4 from 'uuid/v4'
import TextEditor from '../../Editor/Text/Monaco'

export default {
	name: 'window-content',
	components: {
		TextEditor,
	},
	props: {
		content: Object,
	},
	mounted() {
		if (this.content && this.content.focus && this.$refs.input) {
			this.$refs.input.focus()
		}
	},
	data() {
		return {
			cm_content: this.content.input || '',
		}
	},
	computed: {
		action() {
			if (typeof this.internal_action === 'object') {
				let res = {}
				for (let act_key in this.internal_action) {
					res[act_key] = this.makeFunction(
						this.internal_action[act_key]
					)
				}
				return res
			}
			return { default: this.makeFunction(this.internal_action) }
		},
		internal_action() {
			if (typeof this.content.action === 'object') {
				let a = this.content.action
				let res = {}
				if (!a.default) {
					if (a.click) res.default = a.click
					else if (a.enter) res.default = a.click
					else if (a.change) res.default = a.change
					return Object.assign(res, a)
				}
				return a
			}
			return this.content.action
		},
		enter() {
			if (typeof this.content.enter != 'function') return () => {}
			return this.content.enter
		},
		pre_color() {
			if (!this.content.color) return ''
			if (this.content.color.includes(' ')) {
				let tmp = this.content.color.split(' ')
				return `${tmp[0]}--text text--${tmp[1]}`
			}
			return `${this.content.color}--text`
		},
		text_color() {
			if (!this.content.text_color) return ''
			if (this.content.text_color.includes(' ')) {
				let tmp = this.content.text_color.split(' ')
				return `${tmp[0]}--text text--${tmp[1]}`
			}
			return `${this.content.text_color}--text`
		},
	},
	methods: {
		makeFunction(action) {
			if (typeof action !== 'function') return () => {}
			return action
		},
		key(c) {
			return (
				(typeof c === 'function' ? c().key : (c || {}).key) || uuidv4()
			)
		},
	},
	watch: {
		cm_content(to, from) {
			this.action.default(to)
		},
	},
}
</script>

<style scoped>
pre {
	display: inline;
	white-space: pre-wrap;
	cursor: default;
	word-wrap: break-word;
}
i {
	cursor: default;
}
.click-action {
	cursor: pointer;
}
.small-scrollbar::-webkit-scrollbar {
	width: 3px;
	height: 3px;
}
</style>
