#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Highlighter.registerLanguage(name, language_definition)
Bridge.Highlighter.registerLanguage(name, language_definition) allows to register new languages.
For further reference, check the [highlight.js docs](https://highlightjs.readthedocs.io/en/latest/language-guide.html).
Either the name of the language or one of the aliases must match the file extension of the file you want to highlight.

### Arguments
| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | Name of language to register
| language_definition | ```Function``` | Function returning language defintion. Retrieves hljs as an argument

### Example
```javascript
Bridge.Highlighter.registerLanguage("mcfunction", () => {
    return {
        keywords: {
            keyword: "execute scoreboard say tag tickingarea gamerule setblock title effect playsound",
            literal: "true false players operation objectives",
            symbol: "add set remove remove_all dummy"
        },
        contains: [
            hljs.HASH_COMMENT_MODE,
            {
                begin: /(\^|~)?(-)?\b\d+(\.\d+)?/,
                className: "number"
            }
        ]
    };
});
```
