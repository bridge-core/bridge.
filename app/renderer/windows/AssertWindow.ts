import ContentWindow from '../src/commonWindows/Content'

export default class AssertWindow extends ContentWindow {
	constructor(plugin_id: string, assert_msg: string) {
		super(
			{
				display_name: 'Error',
				options: {
					is_frameless: true,
					main_color: 'error darken-1',
					height: 150,
				},
				content: [
					{
						type: 'header',
						text: `ERROR: ${plugin_id}`,
					},
					{
						type: 'divider',
					},
					{
						text: `\n${assert_msg}`,
					},
				],
				actions: [
					{
						type: 'space',
					},
					{
						type: 'button',
						text: 'Okay',
						color: 'error darken-2',
						action: () => {
							this.close()
						},
					},
				],
			},
			`bridge.core.plugin_assert.${plugin_id}.`
		)
	}
}
