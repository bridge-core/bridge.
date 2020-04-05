let isOnline = true

// Use this to know if you're online or not
export const CONNECTION = {
	// Needs to be a getter because the just including isOnline would not make the value reactive to changes
	get isOnline() {
		return isOnline
	},
	// Adds listeners for connection status
	startListening() {
		window.addEventListener('online', () => {
			isOnline = this.navigator.onLine
		})
		window.addEventListener('offline', () => {
			isOnline = this.navigator.onLine
		})
	},
}
