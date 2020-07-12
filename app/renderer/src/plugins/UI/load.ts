import { promises as fs, Dirent } from 'fs'
import { join, extname, basename, relative } from 'path'
import { createErrorNotification } from '../../AppCycle/Errors'
import { TUIStore } from './store'
import { IDisposable } from '../../Types/disposable'
import { executeScript } from '../scripts/execute'
import { createStyleSheet } from '../styles/createStyle'
import { parseComponent } from 'vue-template-compiler'
import Vue from 'vue'

export async function loadUIComponents(
	pluginPath: string,
	uiStore: TUIStore,
	disposables: IDisposable[],
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
					uiStore,
					disposables
				)
			else
				return loadUIComponents(
					join(pluginPath, dirent.name),
					uiStore,
					disposables,
					pluginPath
				)
		})
	)
}

export async function loadUIComponent(
	componentPath: string,
	basePath: string,
	uiStore: TUIStore,
	disposables: IDisposable[]
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
		const { template, script, styles } = parseComponent(
			(await fs.readFile(componentPath)).toString('utf-8')
		)

		const component = {
			name: basename(componentPath),
			...(await (<any>(
				executeScript(
					script?.content?.replace('export default', 'return') ?? '',
					uiStore,
					disposables
				)
			))),
			...Vue.compile(template.content),
		}

		styles.forEach(style =>
			disposables.push(createStyleSheet(style.content))
		)

		resolve(component)
	})

	uiStore.set(
		relative(basePath, componentPath).split(/\\|\//g),
		() => promise
	)
}
