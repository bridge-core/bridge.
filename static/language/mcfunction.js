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
            [/#.*/, 'comment'],
            [/".*"|'.*'/, 'string'],
            [/true|false/, 'boolean'],
            [/ [0-9]+(\.[0-9]+)?/, 'number'],
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

Bridge.registerCompletionProvider({
    triggerCharacters: [' '],
    provideCompletionItems: (model, {
        lineNumber,
        column
    }) => {
        const line = model.getValueInRange({
            startLineNumber: lineNumber,
            endLineNumber: lineNumber,
            startColumn: 0,
            endColumn: column,
        })

        return {
            suggestions: Bridge.AutoCompletions.Text.get(line, "function/main").map(val => ({
                label: val,
                kind: 1,
                insertText: val
            }))
        }
    }
})