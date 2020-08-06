const o = expr => {
	const { object, value } = Bridge.AutoCompletions.eval(expr)
	return Object.keys(object).concat(value)
}

Bridge.registerTokens({
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
	],
	keywords: [
		...o('$dynamic.plugins.custom_commands').map(command =>
			command.replace(/ /g, '')
		),
		...o('$function.main'),
		'scores',
	],
	selectors: o('$function.general.target_selector'),
	tokenizer: {
		root: [
			[/#.*/, 'comment'],
			[/"[^"]*"|'[^']*'/, 'string'],
			[/\=|\,|\!|%=|\*=|\+=|-=|\/=|<|=|>|<>/, 'definition'],
			[/true|false/, 'number'],
			[/-?([0-9]+(\.[0-9]+)?)|(\~|\^-?([0-9]+(\.[0-9]+)?)?)/, 'number'],

			[
				/[a-z_$][\w$]*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@default': 'identifier',
					},
				},
			],
			[
				/@[a|p|r|e|s]/,
				{
					cases: {
						'@selectors': 'type.identifier',
						'@default': 'identifier',
					},
				},
			],
		],
	},
})

Bridge.registerCompletionProvider({
	triggerCharacters: [' '],
	provideCompletionItems: (model, { lineNumber, column }) => {
		const line = model.getValueInRange({
			startLineNumber: lineNumber,
			endLineNumber: lineNumber,
			startColumn: 0,
			endColumn: column,
		})

		return {
			suggestions: Bridge.AutoCompletions.Text.get(
				line,
				'function/main'
			).map(val => ({
				label: val,
				kind: 1,
				insertText: val,
			})),
		}
	},
})

Bridge.registerConfiguration({
	comments: {
		lineComment: '#',
	},
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
			open: '"',
			close: '"',
		},
	],
})
