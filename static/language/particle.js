Bridge.registerTokens({
	ignoreCase: false,
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
		['<', '>', 'delimiter.angle'],
	],
	keywords: [
		'minecraft',
		'description',
		'events',
		'components',
		'curves',
		'bridge',
	],
	titles: ['format_version', 'effect', 'event'],
	symbols: ['sequence', 'randomize', 'particle_effect'],
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
