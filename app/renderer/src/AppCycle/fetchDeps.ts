import { promises as fs } from 'fs'
import { join } from 'path'
import { BRIDGE_DATA_PATH, DEPS_URLS } from '../constants'

export async function loadDependency(src: string) {
	const script = await fetch(join(DEPS_URLS, src))
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
