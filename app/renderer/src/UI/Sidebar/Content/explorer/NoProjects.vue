<template>
	<div style="padding: 4px;">
		<v-subheader>No Behavior Packs Detected</v-subheader>
		<v-divider />
		<p style="word-break: break-word;">
			It looks like you do not have any projects inside the
			"development_behavior_packs" folder yet.
		</p>

		<v-btn color="primary" @click="createBP">Create</v-btn>
		<v-divider />
	</div>
</template>

<script>
import { CreateBP } from '../../../Windows/CreateProject/definition'

export default {
	name: 'explorer-no-projects',
	methods: {
		createBP() {
			CreateBP.open()
		},
	},
}
</script>
