import { ipcRenderer } from 'electron'
import ContentWindow from '../src/commonWindows/Content'
import LoadingWindow from './LoadingWindow'
import { uuid } from '../src/Utilities/useAttr'
import { OBJtoMC } from '../src/Compiler/File/OBJtoMC'
import { promises as fs } from 'fs'
import { CURRENT } from '../src/constants'
import { trySetRP, NEGATIVE_RESPONSES } from '../src/Utilities/FindRP'
import InformationWindow from '../src/commonWindows/Information'
import { join } from 'path'

const INPUT_KEY = uuid()

export default class ImportObjWindow extends ContentWindow {
	constructor() {
		super(
			{
				display_name: 'Import OBJ Model',
				options: { is_persistent: false },
			},
			'bridge.core.import_obj.'
		)
		let objPath: string = undefined
		let texturePath: string = undefined
		let geoID: string = 'unknown'
		let scale: number = 1

		const importOBJ = async () => {
			if (
				geoID === '' ||
				objPath === undefined ||
				texturePath === undefined
			)
				return

			this.close()
			const lw = new LoadingWindow()

			let rpSet = true
			if (
				!CURRENT.RESOURCE_PACK ||
				NEGATIVE_RESPONSES.includes(CURRENT.RESOURCE_PACK)
			)
				rpSet = await trySetRP()
			if (!rpSet) {
				lw.close()
				return new InformationWindow(
					'ERROR',
					'You do not have a resource pack to add the model to.'
				)
			}

			const model = await OBJtoMC(
				objPath,
				texturePath,
				`geometry.${geoID}`,
				scale
			)

			await fs.mkdir(join(CURRENT.RP_PATH, 'models/entity'), {
				recursive: true,
			})
			await fs.writeFile(
				join(CURRENT.RP_PATH, 'models/entity', geoID + '.json'),
				JSON.stringify(model, null, '\t')
			)

			lw.close()
		}

		const actions = () => [
			{
				type: 'space',
			},
			{
				type: 'button',
				color: 'primary',
				text: 'Import!',
				is_disabled:
					geoID === '' ||
					objPath === undefined ||
					texturePath === undefined,

				action: importOBJ,
			},
		]

		const content = () => [
			{
				text: objPath
					? `\n\n OBJ: "${objPath}"\n`
					: '\n\n Please select a model to import\n',
			},
			{
				type: 'divider',
			},
			{
				text: `\n`,
			},
			{
				type: 'button',
				color: 'primary',
				text: 'Choose OBJ File',
				action: async () => {
					const lw = new LoadingWindow()
					const files = await ipcRenderer.invoke('openFileDialog', {
						filters: [{ name: '3D Model', extensions: ['obj'] }],
					})
					if (files.length > 0) objPath = files[0]

					lw.close()
					this.update({ content: content(), actions: actions() })
				},
			},

			{
				text: texturePath
					? `\n\n Texture: "${texturePath}"\n`
					: '\n\n Please select a texture file for this model\n',
			},
			{
				type: 'divider',
			},
			{
				text: '\n',
			},
			{
				type: 'button',
				color: 'primary',
				text: 'Choose Texture',
				action: async () => {
					const lw = new LoadingWindow()
					const files = await ipcRenderer.invoke('openFileDialog', {
						filters: [
							{
								name: 'Texture',
								extensions: ['png', 'jpeg', 'jpg'],
							},
						],
					})
					if (files.length > 0) texturePath = files[0]

					lw.close()
					this.update({ content: content(), actions: actions() })
				},
			},
			{
				text: '\n\n\n',
			},

			{
				type: 'input',
				text: 'Model Identifier',
				color: geoID === '' ? 'error' : 'primary',
				input: geoID,
				key: INPUT_KEY,
				action: {
					enter: importOBJ,
					default: (val: string) => {
						if (val === '' || (geoID === '' && val !== '')) {
							geoID = val
							this.update({
								content: content(),
								actions: actions(),
							})
						} else {
							geoID = val
						}
					},
				},
			},

			{
				text: '\n\n\n',
			},
			{
				type: 'slider',
				text: 'Model Scale',
				min: 0.1,
				max: 10,
				step: 0.1,
				color: 'primary',
				input: scale,
				action: (val: number) => {
					scale = val
				},
			},
		]

		this.update({ content: content(), actions: actions() })
	}
}
