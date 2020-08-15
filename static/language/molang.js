const o = expr => {
	const { object, value } = Bridge.AutoCompletions.eval(expr)
	return Object.keys(object).concat(value)
}

Bridge.registerTokens({
	ignoreCase: true,
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
	],
	keywords: ['return', 'loop', 'for_each', 'break', 'continue', 'this'],
	identifiers: [
		'v',
		't',
		'c',
		'q',
		'variable',
		'temp',
		'context',
		'query',
		'math',
	],
	tokenizer: {
		root: [
			[/'.*'|'.*'/, 'string'],
			[/[0-9]+(\.[0-9]+)?/, 'number'],
			[/true|false/, 'number'],
			[
				/[a-zA-Z_$][\w$]*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@identifiers': 'type.identifier',
						'@default': 'identifier',
					},
				},
			],
		],
	},
})

Bridge.registerCompletionProvider({
	triggerCharacters: ['.'],
	provideCompletionItems: (model, { lineNumber, column }) => {
		let word = model
			.getValueInRange({
				startLineNumber: lineNumber,
				endLineNumber: lineNumber,
				startColumn: 0,
				endColumn: column,
			})
			.toLowerCase()
		const lastSpace = word.lastIndexOf(' ')
		if (lastSpace !== -1) word = word.substring(lastSpace + 1, word.length)

		if (word === 'query.')
			return {
				suggestions: o('$molang.general.query').map(val => ({
					label: val,
					kind: 1,
					insertText: val,
				})),
			}
		if (word === 'math.')
			return {
				suggestions: o('$molang.general.math').map(val => ({
					label: val,
					kind: 1,
					insertText: val,
				})),
			}

		return {
			suggestions: [],
		}
	},
})

Bridge.registerConfiguration({
	autoClosingPairs: [
		{
			open: '(',
			close: ')',
		},
		{
			open: '[',
			close: ']',
		},
		{
			open: '{',
			close: '}',
		},
		{
			open: "'",
			close: "'",
		},
	],
})
