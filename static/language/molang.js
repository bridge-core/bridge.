const c = expr => {
    const {
        object,
        value
    } = Bridge.AutoCompletions.get(expr)
    return object.concat(value)
}
const o = expr => {
    const {
        object,
        value
    } = Bridge.AutoCompletions.eval(expr)
    return Object.keys(object).concat(value)
}

Bridge.registerTokens({
    ignoreCase: true,
    brackets: [
        ['(', ')', 'delimiter.parenthesis'],
        ['[', ']', 'delimiter.square'],
    ],
    tokenizer: {
        root: [
            [/'.*'|'.*'/, 'string'],
            [/[0-9]+(\.[0-9]+)?/, 'number'],
            [/return|query|variable|temp|math/, 'keyword'],
        ],
    },
})

Bridge.registerCompletionProvider({
    triggerCharacters: ['.'],
    provideCompletionItems: (model, {
        lineNumber,
        column
    }) => {
        let word = model.getValueInRange({
            startLineNumber: lineNumber,
            endLineNumber: lineNumber,
            startColumn: 0,
            endColumn: column,
        }).toLowerCase()
        const lastSpace = word.lastIndexOf(' ')
        if (lastSpace !== -1) word = word.substring(lastSpace + 1, word.length)

        if (word === 'query.') return {
            suggestions: o('$molang.general.query').map(val => ({
                label: val,
                kind: 1,
                insertText: val
            }))
        }
        if (word === 'math.') return {
            suggestions: o('$molang.general.math').map(val => ({
                label: val,
                kind: 1,
                insertText: val
            }))
        }

        return {
            suggestions: []
        }
    }
})