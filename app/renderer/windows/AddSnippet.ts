import ContentWindow from '../src/UI/Windows/Common/Content'
import FileType from '../src/editor/FileType'
import Snippets from './Snippets'
import uuidv4 from 'uuid/v4'
import SettingsWindow from './Settings'
import { createInformationWindow } from '../src/UI/Windows/Common/CommonDefinitions'

export default class AddSnippetWindow extends ContentWindow {
	private data: {
		name: string
		file_type: string
		data_path: string
		force_scope: boolean
		template?: string
	}
	private content: any[]
	private actions: any[]

	constructor(parent: SettingsWindow) {
		super(
			{
				display_name: 'Custom Snippet',
				options: {
					is_visible: true,
					is_persistent: false,
					height: 600,
				},
			},
			'add_snippets.'
		)

		this.data = {
			name: '',
			file_type: 'entity',
			data_path: 'minecraft:entity/components',
			force_scope: false,
		}

		this.content = [
			{
				color: 'grey',
				text: '\nFiletype',
			},
			{
				type: 'select',
				options: FileType.getAll(),
				input: 'entity',
				action: (val: string) => (this.data.file_type = val),
			},
			{
				type: 'input',
				key: uuidv4(),
				has_focus: true,
				text: 'Snippet Name',
				action: (val: string) => (this.data.name = val),
			},
			{
				color: 'grey',
				text: '\nDefault Scope',
			},
			{
				type: 'input',
				key: uuidv4(),
				input: 'minecraft:entity/components',
				action: (val: string) => (this.data.data_path = val),
			},
			{
				type: 'switch',
				color: 'primary',
				text: 'Force Default Scope',
				action: (val: boolean) => (this.data.force_scope = val),
			},
			{
				type: 'textarea',
				key: uuidv4(),
				text: 'Snippet Template',
				action: (val: string) => (this.data.template = val),
			},
		]
		this.actions = [
			{
				type: 'space',
			},
			{
				type: 'button',
				color: 'primary',
				is_rounded: false,
				text: 'Add!',
				action: () => {
					let data = this.getTemplate(this.data.template)
					if (this.data.name === '')
						return createInformationWindow(
							'Invlid Snippet Name',
							'You need to provide a name for your snippet.'
						)
					if (data === undefined)
						return createInformationWindow(
							'Invalid Template',
							'The provided snippet template does not conatain valid JSON.'
						)

					let s = {
						id: uuidv4(),
						file_type: this.data.file_type,
						display_name: this.data.name,
						template: {
							data_path: this.data.data_path,
							force_default_scope: this.data.force_scope,
							data,
						},
					}

					parent.save({
						custom_snippets: parent.data.custom_snippets.concat([
							s,
						]),
					})
					parent.select(undefined, true)
					Snippets.addSnippet(s)
					this.close()
				},
			},
		]

		this.updateContent()
	}

	getTemplate(template: string) {
		if (template === '') return

		try {
			return JSON.parse(template)
		} catch (e) {
			try {
				return JSON.parse('{' + template + '}')
			} catch (e) {
				return
			}
		}
	}

	updateContent() {
		this.update({
			content: this.content,
			actions: this.actions,
		})
	}
}
