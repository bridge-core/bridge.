export function transform(children: any[]) {
	let res: any = {}
	let resArr: any[] = []

	if (!children) return {}

	for (const c of children) {
		if (c.is_disabled) continue

		if (c.is_minified && !c.key) resArr.push(c.children)
		else if (c.is_minified && c.key)
			res[c.key] = c.data || c.children || c.array
		else if (Array.isArray(c.children))
			if (c.key) res[c.key] = transform(c.children)
			else resArr.push(transform(c.children))
		else if (c.key && c.data) {
			if (c.key == 'format_version') res[c.key] = c.data
			else res[c.key] = convertValues(c.data)
		} else if (c.array) res[c.key] = transform(c.array)
	}

	return resArr.length > 0 ? resArr : res
}

function convertValues(value: string) {
	if (value == 'false') return false
	else if (value == 'true') return true
	else {
		const newValue = parseInt(value)
		if (isNaN(newValue)) return value
		else return newValue
	}
}
