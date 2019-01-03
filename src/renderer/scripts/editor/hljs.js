import hljs from "highlight.js";

//console.log(hljs);

let selector_args = ["type", "name", "scores", "lm", "l", "rm", "rx", "ry", "r", "dx", "dy", "dz", "x", "y", "z", "tag", "m"].join(" ");
const FUNC_NUMBERS = {
    begin: /(\^|~)?(-)?(\d+(\.\d+)?|\.\d+)/,
    className: "number"
};

hljs.registerLanguage("mcfunction", (hljs) => {
    return {
        keywords: {
            keyword: "execute scoreboard say tag tickingarea tp gamemode gamerule setblock fill title effect playsound kill weather",
            literal: "true false players operation objectives",
            symbol: "add set remove random remove_all dummy replace"
        },
        contains: [
            hljs.HASH_COMMENT_MODE,
            FUNC_NUMBERS,
            {
                begin: /\/(.)+\n/,
                className: "invalid"
            },
            {
                begin: /@(a|p|s|e|r)/,
                className: "literal"
            },
            {
                begin: /\[/,
                end: /\]/,
                contains: [
                    {
                        beginKeywords: selector_args,
                        end: /,/,
                        endsWithParent: true,
                        returnEnd: true,
                        className: "keyword",
                        contains: [
                            {
                                begin: /=/,
                                endsWithParent: true,
                                returnEnd: true,
                                className: "standard",
                                contains: [
                                    Object.assign({    
                                        endsWithParent: true,
                                        returnEnd: true,
                                    }, hljs.QUOTE_STRING_MODE),
                                    Object.assign({    
                                        endsWithParent: true,
                                        returnEnd: true,
                                    }, FUNC_NUMBERS),
                                    {
                                        begin: /{/,
                                        end: /}/,
                                        endsWithParent: true,
                                        endsParent: true
                                    },
                                    {
                                        begin: /[^,]/,
                                        endsWithParent: true,
                                        returnEnd: true,
                                        className: "literal"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
});

export default hljs;