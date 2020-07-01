const { Node, GlobalNode } = Bridge

function includesOneOf(arr1, arr2, included = []) {
	const includesOneOf = arr1.some(e => {
		if (arr2.includes(e)) {
			included.push(e)
			return true
		}

		if (included.length < 2) included.push(e)
		return false
	})

	if (included.length < 2) included.push(arr1[1])

	return includesOneOf
}

function validateEvent() {
	Node.error = undefined

	const keys = Object.keys(Node.toJSON())

	const included = []

	if (
		keys.length > 1 &&
		includesOneOf(keys, ['sequence', 'randomize'], included)
	) {
		Node.error = {
			show: true,
			message: `You may not combine "${included[0]}" with "${included[1]}"`,
		}
	}
}

validateEvent()
Node.on.change.set(Node, validateEvent)
