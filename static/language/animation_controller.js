Bridge.registerTokens({
	ignoreCase: false,
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
		['<', '>', 'delimiter.angle'],
	],
	keywords: ['animation_controllers', 'states'],
	titles: ['format_version', 'on_entry', 'on_exit'],
	symbols: ['animations', 'transitions', 'variables', 'particle_effects'],
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
