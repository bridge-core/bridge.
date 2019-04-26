import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple.js";

CodeMirror.defineSimpleMode("mcfunction", {
    start: [
        { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
        { regex: /(?:minecraft|execute|effect|summon|setblock|fill|scoreboard|detect|tellraw|testfor|testforblock|testforblocks|say|tellraw|kill|setworldspawn|spawnpoint|gamemode|tp|teleport|replaceitem|clear|enchant|give|weather|xp|clone|title|stopsound|playsound|tag|help|function|tickingarea|func|dynamicfunction)\b/, token: "keyword" },
        // { regex: /(?:type|l|lm|r|rm|x|dx|y|dy|z|dz|rx|ry|scores|tag|name)\b/, token: "variable-3" },
        { regex: /(?:@a|@e|@s|@r|@p)\b/, token: "variable-3" },
        { regex: /true|false/, token: "atom" },
        { regex: /(?:=|=\!|\,)\b/, token: "def" },
        { regex: /[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number" },
        { regex: /#.*/, token: "comment" },

        { regex: /(?:~|\^)\b/, token: "operator" }
    ],
    meta: {
        lineComment: "#"
    }
});