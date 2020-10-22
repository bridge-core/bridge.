<template>
	<transition-group mode="out-in" name="hotbar" class="hotbar">
		<v-avatar
			tile
			v-for="(id, i) in HotbarState"
			:key="`${i}.${id}`"
			:size="i === 0 ? '40px' : '24px'"
			@click="onSelect(i)"
			v-ripple
			style="transition: all 0.2s ease-in-out; margin-right: 4px;"
			class="hotbar-item"
		>
			<img
				alt="Avatar"
				:src="getTexture(id)"
				style="image-rendering: pixelated;"
			/>
		</v-avatar>
		<v-avatar
			key="open-inventory"
			v-ripple
			tile
			color="primary"
			size="24px"
		>
			<v-icon>mdi-dots-horizontal</v-icon>
		</v-avatar>
	</transition-group>
</template>

<script>
import { HotbarState, select } from './Hotbar.ts'
import { BlockLibrary } from '../BlockLibrary/main'

export default {
	name: 'Hotbar',

	data: () => ({ HotbarState }),
	methods: {
		getTexture(blockId) {
			return BlockLibrary.getDisplayTexture(blockId)
		},
		onSelect(id) {
			select(id)
		},
	},
}
</script>

<style scoped>
.hotbar {
	background: rgba(0, 0, 0, 0.2);
	padding: 8px;
}
.hotbar-item {
	display: inline-block;
	transition: all 0.1s;
}
.hotbar-enter,
.hotbar-leave-to {
	opacity: 0;
	transform: translateX(30px);
}
.hotbar-leave-active {
	position: absolute;
}
</style>
