<template>
	<div>
		<component
			v-for="([windowComponent, windowApi], uuid) in WINDOWS"
			:key="uuid"
			:is="windowComponent"
			:currentWindow="windowApi"
		/>
	</div>
</template>

<script>
import { WINDOWS } from './create'

export default {
	name: 'CollectedWindows',

	data: () => ({
		WINDOWS,
	}),
}
</script>
