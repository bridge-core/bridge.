if (Bridge.Node.data === '') return

try {
	Bridge.MoLang.parse(Bridge.Node.data)
} catch (err) {
	console.log(err)
	Bridge.Node.error = {
		show: true,
		message: err.message,
	}
}
