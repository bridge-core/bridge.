import JSONTree from '../JsonTree'

export function canBeMinified(node: JSONTree, first = true) {
	if (first && node.children.length === 0 && node.data !== '') return false

	for (const child of node.children) {
		if (
			(child.open && child.children.length > 0) ||
			child.comment ||
			!child.is_active ||
			!canBeMinified(child, false)
		)
			return false
	}
	return true
}

export function getCacheData(node: JSONTree) {
	return {
		open: node.open && node.parent ? true : undefined,
		comment: node.comment ? node.comment : undefined,
		data: node.data ? node.data : undefined,
		key: !node.parent?.is_array && node.parent ? node.key : undefined,
		is_active: node.is_active === true ? undefined : false,
	}
}
