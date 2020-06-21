import { promises as fs, Dirent } from 'fs'
import { join, extname, basename, relative } from 'path'
import { createErrorNotification } from '../../AppCycle/Errors'
import { TUIStore } from './store'
import { IDisposable } from '../../Types/disposable'
import { executeScript } from '../scripts/execute'
import { createStyleSheet } from '../styles/createStyle'

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
		const fileContent = (await fs.readFile(componentPath)).toString('utf-8')
		const templates = fileContent.match(/<template>.*<\/template>/gs) ?? [
			'<template></template>',
		]
		const scripts = fileContent.match(/<script>.*<\/script>/gs) ?? [
			'<script>return {}</script>',
		]
		const style = fileContent.match(/<style>.*<\/style>/gs)
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
			...(await (<any>executeScript(script, uiStore, disposables))),
			template,
		}

		if (style)
			disposables.push(
				createStyleSheet(style[0].substring(7, style[0].length - 9))
			)

		resolve(component)
	})

	uiStore.set(
		relative(basePath, componentPath).split(/\\|\//g),
		() => promise
	)
}
