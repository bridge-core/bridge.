import { ipcRenderer } from 'electron'
import ContentWindow from '../scripts/commonWindows/Content'
import LoadingWindow from './LoadingWindow'
import { uuid } from '../scripts/Utilities/useAttr'
import { OBJtoMC } from '../scripts/Compiler/File/OBJtoMC'
import { promises as fs } from 'fs'
import { CURRENT } from '../scripts/constants'
import { trySetRP } from '../scripts/Utilities/FindRP'
import InformationWindow from '../scripts/commonWindows/Information'
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
			if (!CURRENT.RP_PATH) rpSet = await trySetRP()
			if (!rpSet)
				return new InformationWindow(
					'ERROR',
					'You do not have a resource pack to add the model to.'
				)

			const model = await OBJtoMC(
				objPath,
				texturePath,
				`geometry.${geoID}`
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
								extensions: ['png', 'jpeg'],
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
		]

		this.update({ content: content(), actions: actions() })
	}
}
