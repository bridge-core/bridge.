Bridge.registerTokens({
    ignoreCase: false,
    brackets: [
        ['(', ')', 'delimiter.parenthesis'],
        ['[', ']', 'delimiter.square'],
        ['{', '}', 'delimiter.curly'],
        ['<', '>', 'delimiter.angle'],
    ],
    keywords: [
        "minecraft",
        "bridge",
        "description",
        "component_groups",
        "components",
        "events"
    ],
    titles: [
        "format_version",
        "event"
    ],
    symbols: [
        "add",
        "remove",
        "sequence",
        "randomize",
        "scripts",
        "animations",
        "spawn_egg",
        "materials",
        "textures",
        "geometry",
        "render_controllers"
    ],
    tokenizer: {
        root: [
            [/".*"|'.*'/, 'string'],
            [/[0-9]+(\.[0-9]+)?/, 'number'],
            [/true|false/, 'number'],
            [
                /[\w$]*[a-z_$][\w$]*/,
                    cases: {
                        '@keywords': 'keyword',
                        '@titles': 'type.identifier',
                        '@symbols': 'definition',
                        '@default': 'identifier'
                    }
                },
            ],
        ],
    },
})