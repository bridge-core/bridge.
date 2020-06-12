Bridge.registerTokens({
    ignoreCase: false,
    brackets: [
        ['(', ')', 'delimiter.parenthesis'],
        ['[', ']', 'delimiter.square'],
        ['{', '}', 'delimiter.curly'],
        ['<', '>', 'delimiter.angle'],
    ],
    tokenizer: {
        root: [
            [/".*"|'.*'/, 'string'],
            [/[0-9]+(\.[0-9]+)?/, 'number'],
            [/true|false/, 'number'],
            [/minecraft|bridge|description|component_groups|components|events/, 'keyword'],
            [/format_version|event/, 'type.identifier'],
        ],
    },
})