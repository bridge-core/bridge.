const o = expr => {
	const { object, value } = Bridge.AutoCompletions.eval(expr)
	return Object.keys(object).concat(value)
}

Bridge.registerTokens({
	tokenizer: {
		root: [
			[/##.*/, 'comment'],
			[/=|\.|:/, 'definition'],
			[Bridge.Project.getPrefix(), 'variable'],
		],
	},
})

const getSuggestions = () => [
	...o('$dynamic.cache.item.identifiers').map(id => `item.${id}`),
	...o('$dynamic.cache.block.identifiers').map(id => `tile.${id}.name`),
	...o('$dynamic.cache.entity.identifiers').map(
		id => `item.spawn_egg.entity.${id}.name`
	),
	...o('$dynamic.cache.entity.identifiers').map(id => `entity.${id}.name`),
]

Bridge.registerCompletionProvider({
	triggerCharacters: ['='],
	provideCompletionItems: (model, { lineNumber, column }) => {
		let id = model
			.getValueInRange({
				startLineNumber: lineNumber,
				endLineNumber: lineNumber,
				startColumn: 0,
				endColumn: column,
			})
			.toLowerCase()

		if (id[id.length - 1] === '=') {
			const textTranslation = id
				.substring(0, id.length - 1)
				.split('.')
				.find(val => val.includes(':'))
				.split(':')
				.pop()
				.replace(/_.|^./g, match => {
					if (match.length === 1) return match.toUpperCase()
					return ` ${match[1].toUpperCase()}`
				})

			return {
				suggestions: [
					{
						label: textTranslation,
						insertText: textTranslation,
						kind: 1,
					},
				],
			}
		}

		return {
			suggestions: getSuggestions().map(val => ({
				label: val,
				kind: 1,
				insertText: val,
			})),
		}
	},
})

Bridge.registerConfiguration({
	comments: {
		lineComment: '##',
	},
})
