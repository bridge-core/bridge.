const o = expr => Object.keys(Bridge.AutoCompletions.eval(expr).object)

Bridge.registerTokens({
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
	],
	// defaultToken: 'keyword',
	tokenizer: {
		root: [
			[/".*"|'.*'/, 'string'],
			[/true|false/, 'boolean'],
			[/[0-9]+(\.[0-9]+)?/, 'number'],
			[
				new RegExp(
					[
						...o('$dynamic.plugins.custom_commands'),
						...o('$function.main'),
					].join('|')
				),
				'keyword',
			],
		],
	},
})
