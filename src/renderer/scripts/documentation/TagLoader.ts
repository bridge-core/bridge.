import FetchDefinitions from '../editor/FetchDefinitions'
import OmegaCache from '../editor/OmegaCache'
import JSONTree from '../editor/JsonTree'

let CACHE: TagInfo[]

export interface TagInfo {
	id: string
	description: string
	used_components: string[]
	categories?: string[]
	events: { [s: string]: string }
}

export async function resetTagCache() {
	CACHE = undefined
}

export async function loadTags(use_cache = true): Promise<TagInfo[]> {
	if (use_cache && CACHE !== undefined) return CACHE

	return (CACHE = (
		await Promise.all(
			Object.entries(
				await FetchDefinitions.getAll('entity_tag', 'identifiers')
			).map(loadTag)
		)
	).filter(tag_info => tag_info !== undefined))
}

async function loadTag([file_path, [id, ...other_ids]]: [
	string,
	string[]
]): Promise<TagInfo> {
	if (!file_path) return
	if (other_ids.length > 0)
		throw new Error(
			`Tags should only have one unique ID! Found ${other_ids.length} IDs.`
		)

	let { cache_content, format_version } = await OmegaCache.load(
		OmegaCache.constructPath(file_path)
	)
	let loaded_content = OmegaCache.loadContent(cache_content, format_version)
	try {
		let { components = {}, component_groups = {} } = loaded_content
			.get('bridge:tag')
			.toJSON()

		if (loaded_content instanceof JSONTree) {
			let events: { [s: string]: string } = {}
			if (loaded_content.get('bridge:tag/events'))
				loaded_content
					.get('bridge:tag/events')
					.children.forEach(
						(n: JSONTree) => (events[n.key] = n.comment)
					)

			return {
				id,
				description: loaded_content.get('bridge:tag').comment,
				used_components: Object.keys(components).concat(
					Object.values(component_groups)
						.map(group => Object.keys(group))
						.flat()
				),
				events,
			}
		}
	} catch (e) {}
}
