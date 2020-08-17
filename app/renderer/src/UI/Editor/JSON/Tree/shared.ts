import TabSystem from '../../../../TabSystem'

export default {
	computed: {
		isInArray() {
			return this.tree.parent && this.tree.parent.is_array
		},
		dataPath() {
			return `${this.tree.path}/${this.tree.data.replace(
				/\//g,
				'#;slash;#'
			)}`
		},
	},
	methods: {
		getData(data: unknown) {
			if (data === '') return '{}'
			if (this.tree.meta.language) return data
			if (!Number.isNaN(Number(data))) return data
			if (data === 'true' || data === 'false') return data
			return `"${data}"`
		},

		isSelected() {
			return TabSystem.getCurrentNavigation() === this.tree.path
		},
		isDataSelected() {
			return TabSystem.getCurrentNavigation() === this.dataPath
		},
		onClick(event: KeyboardEvent) {
			event.preventDefault()
			if (!this.$store.state.Settings.cade_node_click && !event.ctrlKey) {
				if (this.tree.open && !this.isSelected()) {
					//CANNOT BE EARLY RETURN; PATH NEEDS TO BE SET FURTHER BELOW
				} else if (!this.tree.open) {
					this.tree.openNode(true)
				} else {
					this.tree.openNode(false)
				}
			} else if (event.ctrlKey) {
				this.tree.toggleOpenDeep()
			}

			TabSystem.setCurrentFileNav(this.tree.path)

			//Node already has data meaning that we can focus the editing input (no new children can be added)
			if (this.tree.data !== '') {
				this.$nextTick(() => {
					const input = document.getElementById('json-editing-input')
					if (input) input.focus()
				})
			}
		},
		onIconClick(event: KeyboardEvent) {
			event.stopImmediatePropagation()
			this.tree.toggleOpen()
		},
		onDataClick(event: KeyboardEvent) {
			if (this.tree.data === '') return

			event.preventDefault()

			TabSystem.setCurrentFileNav(this.dataPath)

			this.$nextTick(() => {
				const input = document.getElementById('json-editing-input')
				if (input) input.focus()
			})
		},
	},
}
