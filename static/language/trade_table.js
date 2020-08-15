Bridge.registerTokens({
	ignoreCase: false,
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
		['<', '>', 'delimiter.angle'],
	],
	keywords: ['minecraft', 'tiers', 'trades', 'groups', 'bridge'],
	titles: ['item', 'quantity'],
	symbols: ['wants', 'gives'],
	tokenizer: {
		root: [
			[/".*"|'.*'/, 'string'],
			[/[0-9]+(\.[0-9]+)?/, 'number'],
			[/true|false/, 'number'],
			[
				/[\w$]*[a-z_$][\w$]*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@titles': 'type.identifier',
						'@symbols': 'definition',
						'@default': 'identifier',
					},
				},
			],
		],
	},
})
