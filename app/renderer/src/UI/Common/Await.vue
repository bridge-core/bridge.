<template>
	<span>
		<slot v-if="isLoading" name="pending" />
		<slot v-else-if="error" name="error" />
		<slot v-else v-bind:data="value" name="default" />
	</span>
</template>

<script>
export default {
	name: 'Await',
	props: {
		promise: Promise,
	},
	data: () => ({
		isLoading: true,
		error: undefined,
		value: undefined,
	}),
	created() {
		this.promise
			.then(value => {
				this.isLoading = false
				this.value = value
			})
			.catch(err => (this.error = err))
	},
}
</script>

<style></style>
