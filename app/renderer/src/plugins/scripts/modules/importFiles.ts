import { IModuleConfig } from '../types'
import { IAppMenuElement } from '../../../UI/Toolbar/create'
import uuid from 'uuid/v4'
import { ipcRenderer, OpenDialogOptions } from 'electron'
import LoadingWindow from '../../../../windows/LoadingWindow'

export interface IImporterElement extends IAppMenuElement {
	onImport: (filePath: string) => Promise<void> | void
}

export const ImportFileMap = new Map<string, IAppMenuElement>()

export const ImportFileModule = ({ disposables }: IModuleConfig) => ({
	register(
		{ onImport, ...config }: IImporterElement,
		dialogOptions: OpenDialogOptions
	) {
		const id = uuid()

		ImportFileMap.set(id, {
			...config,
			elements: undefined,
			keyBinding: undefined,
			onClick: async () => {
				const lw = new LoadingWindow()

				await Promise.all(
					(
						await ipcRenderer.invoke(
							'openFileDialog',
							dialogOptions
						)
					).map(onImport)
				)

				lw.close()
			},
		})

		disposables.push({
			dispose: () => ImportFileMap.delete(id),
		})
	},
})
