import ContentWindow from '../src/UI/Windows/Common/Content'
import uuidv4 from 'uuid/v4'
import TabSystem from '../src/TabSystem'
import { JSONAction } from '../src/TabSystem/CommonHistory'
import JSONTree from '../src/editor/JsonTree'

export default class EditMoLangWindow extends ContentWindow {
	private input: string

	constructor(moLang: string, node_context: JSONTree) {
		super({
			display_name: 'Edit MoLang',
			options: {
				is_persistent: false,
				is_maximizable: false,
				height: 316,
				no_padding: true,
			},
			content: [
				{
					type: 'monaco',
					key: uuidv4(),
					input: moLang.replace(/\; /g, ';\n'),
					language: 'molang',
					action: (val: string) => {
						val = val
							.split(/\n/g)
							.filter(e => e !== '')
							.join('\n')
						this.input = val
							.replace(/\s\.\s/g, '.')
							.replace(/\;\n/g, '; ')
					},
				},
			],
			actions: [
				{
					type: 'space',
				},
				{
					type: 'button',
					text: 'Edit!',
					color: 'primary',
					is_rounded: false,
					action: () => {
						TabSystem.getHistory().add(
							new JSONAction(
								'edit-data',
								node_context,
								node_context.data
							)
						)
						node_context.edit(this.input)
						TabSystem.setCurrentUnsaved()
						this.close()
					},
				},
			],
		})

		this.input = moLang.replace(/\; /g, ';\n')
	}
}
