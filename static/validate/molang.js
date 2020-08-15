//Reset previous errors
Bridge.Node.error = undefined

//Empty strings don't need to be validated
if (Bridge.Node.data === '') return

try {
	//Try to parse MoLang
	Bridge.MoLang.parse(Bridge.Node.data)
} catch (err) {
	//An error occurred -> MoLang is invalid -> Report error
	Bridge.Node.error = {
		show: true,
		isDataError: true,
		message: err.message,
	}
}
