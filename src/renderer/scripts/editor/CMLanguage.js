/**
 * Registers new codemirror languages from JSON files
 */
import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple.js";
import FileType from "./FileType";
import eRE from "../utilities/EscapeRegExp";

export default function loadAllTextHighlighters() {
    FileType.getTextHighlighters().forEach(({ set, define }) => {
        const { extension, line_comment, string_character } = set;
        const { titles, atoms, symbols, operators, keywords } = define;
        let start = [];

        start.push({ regex: new RegExp(`${string_character}(?:[^\\\\]|\\\\.)*?(?:${string_character}|$)`), token: "string" });

        if(keywords !== undefined)
            start.push({ regex: new RegExp(`(?:${eRE(keywords).join("|")})\\b`), token: "keyword" });
        if(titles !== undefined)
            start.push({ regex: new RegExp(`(?:${eRE(titles).join("|")})\\b`), token: "variable-3" });
        if(atoms !== undefined)
            start.push({ regex: new RegExp(`(?:${eRE(atoms).join("|")})\\b`), token: "atom" });
        if(symbols !== undefined)
            start.push({ regex: new RegExp(`(?:${eRE(symbols).join("|")})\\b`), token: "def" });
        if(operators !== undefined)
            start.push({ regex: new RegExp(`(?:${eRE(operators).join("|")})\\b`), token: "operator" });

        start.push({ regex: /[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number" });
        start.push({ regex: new RegExp(`${eRE(line_comment)}.*`), token: "comment" });
    
        CodeMirror.defineSimpleMode(extension, {
            start,
            meta: {
                lineComment: line_comment || "//"
            }
        })
    });
}           