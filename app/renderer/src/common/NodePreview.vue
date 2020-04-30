<template>
	<div
		@click="$emit('click')"
		class="small-scrollbar"
		style="display: block; overflow-x: auto; white-space: nowrap; width: 100%"
	>
		<!-- KEY DISPLAY -->
		<highlight-text>{{ node_context.key }}</highlight-text>

		<!-- DATA DISPLAY -->
		<span v-if="node_context.data !== ''">
			<span>:</span>
			<highlight-attribute
				:data="node_context.data"
				:as_block="false"
				:meta="node_context.meta"
				:node_context="node_context"
				:is_immutable="true"
			/>
		</span>
	</div>
</template>

<script>
import HighlightText from '../EditorShell/JsonEditor/HighlightText'
import HighlightAttribute from '../EditorShell/JsonEditor/HighlightAttribute'

export default {
	name: 'node-preview',
	components: {
		HighlightText,
		HighlightAttribute,
	},
	props: {
		node_context: Object,
	},
}
</script>

<style></style>
