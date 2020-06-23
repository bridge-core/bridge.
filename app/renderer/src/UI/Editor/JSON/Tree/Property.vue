<template>
	<span>
		<!-- <Highlight
			v-if="!isEditing"
			tagName="summary"
			:language="language"
			:value="treeKey"
			:isOnScreen="isOnScreen"
			@click.native="onClick"
		/>:
		<input
			v-else
			ref="input"
			class="inline-edit"
			v-model="treeKey"
			@blur="deactivateEditMode"
			@keydown.enter="deactivateEditMode"
		/>-->
	</span>
</template>

<script>
import Highlight from '../Highlight.vue'
import JSONTree from '../../../../editor/JsonTree'
import TabSystem from '../../../../TabSystem'

export default {
	name: 'TreeProperty',
	props: {
		isOnScreen: Boolean,
		tree: JSONTree,
		language: String,
	},
	components: {
		Highlight,
	},
}
</script>