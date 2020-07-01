const { Node, LightningCache, Tab } = Bridge

//Delete previous error
Node.error = undefined
//Filter target is invalid
if (Node.data === '') {
	//Show error
	Node.error = {
		show: true,
		message: `Invalid event target`,
		fix: {
			run: () => {
				Node.edit('self', true)
				Tab.setUnsaved()
			},
		},
	}
}
