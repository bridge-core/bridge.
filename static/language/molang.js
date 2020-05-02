Bridge.registerTokens({
	ignoreCase: true,
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
	],
	tokenizer: {
		root: [
			[/".*"|'.*'/, 'string'],
			[/[0-9]+(\.[0-9]+)?/, 'number'],
			[/query|variable|temp|math/, 'keyword'],
		],
	},
})
