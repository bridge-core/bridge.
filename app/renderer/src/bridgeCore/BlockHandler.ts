import { set } from '../Utilities/useAttr'
import { OnSaveData } from './main'
import { iterateEvents } from './events/iterate'

export default async function BlockHandler({
	file_uuid,
	data,
	file_name,
}: OnSaveData) {
	//DATA
	let block = data['minecraft:block']
	if (!block) return
	set(block, 'components', {})
	set(block, 'description', {})
	set(block, 'events', {})

	await iterateEvents(file_uuid, file_name, block.events)
}
