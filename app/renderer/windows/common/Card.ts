import ContentWindow from '../../src/UI/Windows/Common/Content'

export interface CardConfig {
	title: string
	description: string
	categories: string[]
}

export default class CommonCard {
	private type = 'card'
	above_content: any[]
	content: any[]
	below_content: any[]

	constructor(
		parent: ContentWindow,
		{ title, description, categories }: CardConfig,
		below_content?: any[],
		close_parent = true
	) {
		this.above_content = [
			{
				text: title,
			},
		]

		this.content = [
			{
				type: 'container',
				content: categories.map(t => ({
					type: 'tag',
					text: t,
					action: () => {
						if (close_parent) parent.close()
					},
				})),
			},
			{ type: 'divider' },
			{
				text: `\n${description}\n\n`,
			},
			{ type: 'divider' },
		]

		this.below_content = below_content
	}
}
