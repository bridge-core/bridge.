Bridge.registerTokens({
	ignoreCase: false,
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
		['<', '>', 'delimiter.angle'],
	],
	keywords: ['render_controllers'],
	titles: [
		'format_version',
		'rebuild_animation_matrices',
		'light_color_multiplier',
		'ignore_lighting',
	],
	symbols: [
		'arrays',
		'geometry',
		'part_visibility',
		'uv_anim',
		'textures',
		'geometries',
		'materials',
		'overlay_color',
	],
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
