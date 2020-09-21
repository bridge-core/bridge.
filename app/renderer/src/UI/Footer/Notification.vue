<template>
	<v-chip
		@click="$emit('click')"
		small
		:color="color || 'primary'"
		:text-color="textColor"
		label
	>
		<v-progress-linear
			v-if="expiration"
			absolute
			bottom
			:value="currProgress"
			height="2px"
			background-color="white"
			color="white"
			:background-opacity="0.2"
		/>
		<v-icon
			small
			:style="`padding-right: 6px; opacity: ${1 - isDarkMode * 0.25};`"
			>{{ icon }}</v-icon
		>
		<span :style="`opacity: ${1 - isDarkMode * 0.25};`">{{ message }}</span>
	</v-chip>
</template>

<script>
export default {
	name: 'Notification',
	props: {
		icon: String,
		message: String,
		color: String,
		textColor: String,
		expiration: Number,
	},
	data: () => ({
		currProgress: 0,
		originalTime: 0,
	}),
	mounted() {
		if (this.expiration) {
			this.originalTime = Date.now()
			this.update()
		}
	},
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
	},
	methods: {
		update() {
			this.currProgress =
				((Date.now() - this.originalTime) /
					(this.expiration - this.originalTime)) *
				100
			if (this.currProgress < 100) setTimeout(this.update, 750)
		},
	},
}
</script>

<style scoped>
.v-chip {
	cursor: pointer;
}
</style>
