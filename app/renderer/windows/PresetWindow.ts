import TabWindow from '../src/UI/Windows/Common/TabWindow'
import { loadPresets, buildPreset } from '../src/Presets'
import LoadingWindow from './LoadingWindow'
import { uuid } from '../src/Utilities/useAttr'
import { compileCondition } from '../src/autoCompletions/components/VersionedTemplate/Common'

export default class PresetWindow extends TabWindow {
	private action_button = {
		type: 'button',
		text: 'Create!',
		color: 'primary',
		is_disabled: true,
		action: () => {},
	}
	private input = ''
	constructor() {
		super(
			'Presets',
			{ is_persistent: false },
			'bridge.core.presets_window.'
		)
		this.win_def.content = [
			{
				text: '\n',
			},
			{
				type: 'loader',
			},
		]
		this.win_def.actions = [
			{
				type: 'space',
			},
			this.action_button,
		]
		this.update()
		this.init()
	}

	async init() {
		let data_arr = await loadPresets()

		data_arr
			.filter(
				({ manifest: { target_version } }) =>
					target_version === undefined ||
					compileCondition(target_version)
			)
			.sort(
				(
					{ manifest: { display_name: nameA } },
					{ manifest: { display_name: nameB } }
				) => nameA.localeCompare(nameB)
			)
			.forEach(data => {
				this.addTab({
					sidebar_element: {
						icon: data.manifest.icon,
						title: data.manifest.display_name,
					},
					content: [
						{
							key: uuid(),
							text: `\n${data.manifest.description ||
								'No description provided!'}\n\n`,
						},
						{
							type: 'input',
							text: 'Identifier',
							key: uuid(),
							action: {
								default: (inp: string) => {
									this.input = inp

									if (
										this.input === '' ||
										this.input.includes(' ')
									)
										this.action_button.is_disabled = true
									else this.action_button.is_disabled = false
									this.update()

									this.action_button.action = async () => {
										this.close()
										let lw = new LoadingWindow()
										let inputValue = this.input.toLowerCase()
										if (inputValue.includes(':'))
											inputValue = inputValue
												.split(':')
												.pop()

										await buildPreset(data, inputValue)
										lw.close()
									}
								},
								enter: () => {
									if (this.input !== '')
										this.action_button.action()
								},
							},
						},
						{
							key: uuid(),
							text:
								'\nThe identifier will be used as a file name for all files this preset creates. It should not contain your namespace because bridge. adds it automatically where needed. Do not use spaces inside of your identifier!\n',
						},
						{
							key: uuid(),
							text: 'Example: "test_preset"',
							color: 'grey',
						},
					],
				})
			})

		this.update()
	}

	select(id?: number, force_update?: boolean) {
		this.input = ''
		this.action_button.is_disabled = true

		super.select(id, force_update)
	}
}
