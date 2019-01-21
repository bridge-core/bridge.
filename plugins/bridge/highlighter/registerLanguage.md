#### [<< Back](https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md)
## Bridge.Highlighter.registerLanguage(name, language_definition)
Bridge.Highlighter.registerLanguage(name, language_definition) allows to register new languages.
For further reference, check the [CodeMirror docs](https://codemirror.net/demo/simplemode.html).
In order for a language to be used, you need to register a file extension (or make the language ```name``` the extension).

### Arguments
| Argument | Type | Description
| --- | --- | ---
| name | ```String``` | Name of language to register
| language_definition | ```Object``` | Language definition

### Example
```javascript
Bridge.Highlighter.registerLanguage("mcfunction", {
    start: [
        {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
        {regex: /(?:execute|effect|summon|setblock|fill|scoreboard|detect|testforblock|testforblocks|say|tellraw|kill|setworldspawn|spawnpoint|gamemode|tp|teleport|replaceitem|clear|enchant|give|weather|xp|clone|title|stopsound|playsound|tag|help)\b/, token: "keyword"},
        {regex: /(?:@a|@e|@s|@r|@p)\b/, token: "variable-3"},
        {regex: /true|false/, token: "atom"},
        {regex: /(?:=|=\!|\,)\b/, token: "def"},
        {regex: /[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
        {regex: /#.*/, token: "comment"},

        {regex: /(?:~|\^)\b/, token: "operator"}
    ],
    meta: {
        lineComment: "#"
    }
});
```
