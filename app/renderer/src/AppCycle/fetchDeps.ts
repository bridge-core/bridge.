import { promises as fs } from 'fs'
import { join } from 'path'
import { BRIDGE_DATA_PATH, DEPS_URLS } from '../constants'
import Store from '../../store/index'

export async function loadDependency(src: string) {
	// In development mode, always use data from disk
	if (process.env.NODE_ENV === 'development' && process.env.DEV_DATA_PATH)
		return eval(
			await (
				await fs.readFile(join(process.env.DEV_DATA_PATH, src))
			).toString('utf-8')
		)

	// Get the latest data release tag
	let latestTag: string
	try {
		const tags = await fetch(
			'https://api.github.com/repos/bridge-core/data/tags'
		).then(data => data.json())
		latestTag = tags[0].name
	} catch {}

	const script = await fetch(
		join(
			DEPS_URLS(
				Store.state.Settings.remote_data_version === 'latest'
					? latestTag ?? 'latest'
					: Store.state.Settings.remote_data_version
			),
			src
		)
	)
		.then(data => data.text())
		.then(async script => {
			try {
				fs.mkdir(join(BRIDGE_DATA_PATH, 'cache'), { recursive: true })
			} catch {}
			fs.writeFile(join(BRIDGE_DATA_PATH, 'cache', src), script)
			return script
		})
		.catch(async () => {
			return await (
				await fs.readFile(join(BRIDGE_DATA_PATH, 'cache', src))
			).toString('utf-8')
		})

	return eval(script)
}
