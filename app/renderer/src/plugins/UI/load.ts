import { promises as fs, Dirent } from 'fs'
import { join, extname, basename, relative, sep } from 'path'
import { createErrorNotification } from '../../AppCycle/Errors'
import { run } from '../../editor/ScriptRunner/run'
import { TUIStore } from './store'

export async function loadUIComponents(
	pluginPath: string,
	uiStore: TUIStore,
	basePath = pluginPath
) {
	let dirents: Dirent[] = []
	try {
		dirents = await fs.readdir(pluginPath, { withFileTypes: true })
	} catch {}

	await Promise.all(
		dirents.map(dirent => {
			if (dirent.isFile())
				return loadUIComponent(
					join(pluginPath, dirent.name),
					basePath,
					uiStore
				)
			else
				return loadUIComponents(
					join(pluginPath, dirent.name),
					uiStore,
					pluginPath
				)
		})
	)
}

export async function loadUIComponent(
	componentPath: string,
	basePath: string,
	uiStore: TUIStore
) {
	if (extname(componentPath) !== '.vue') {
		createErrorNotification(
			new Error(
				`NOT A VUE FILE: Provided UI file "${basename(
					componentPath
				)}" is not a vue file!`
			)
		)
		return
	}

	const promise = new Promise(async (resolve, reject) => {
		const fileContent = (await fs.readFile(componentPath)).toString('utf-8')
		const templates = fileContent.match(/<template>.*<\/template>/gs)
		const scripts = fileContent.match(/<script>.*<\/script>/gs)
		if (templates.length > 1 || scripts.length > 1) {
			createErrorNotification(
				new Error(
					`INVALID VUE FILE: Found multiple templates or scripts inside of "${basename(
						componentPath
					)}"!`
				)
			)
			return reject()
		}

		const template = templates[0].substring(11, templates[0].length - 12)
		const script = scripts[0]
			.substring(8, scripts[0].length - 9)
			.replace('export default', 'return')

		const component = {
			name: basename(componentPath),
			...run(script, { UI: uiStore.UI }, 'file'),
			template,
		}
		resolve(component)
	})

	uiStore.set(
		relative(basePath, componentPath).split(/\\|\//g),
		() => promise
	)
}
