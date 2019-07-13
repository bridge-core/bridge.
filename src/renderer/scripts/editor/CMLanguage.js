import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple.js";
import FileType from "./FileType";
import eRE from "../utilities/EscapeRegExp";

export default function loadAllTextHighlighters() {
    FileType.getTextHighlighters().forEach(({ set, define }) => {
        const { extension, line_comment, string_character } = set;
        const { titles, atoms, symbols, operators, keywords } = define;
    
        CodeMirror.defineSimpleMode(extension, {
            start: [
                { regex: new RegExp(`${string_character}(?:[^\\\\]|\\\\.)*?(?:${string_character}|$)`), token: "string" },
                { regex: new RegExp(`${eRE(keywords).join("|")}\b`), token: "keyword" },
                { regex: new RegExp(`${eRE(titles).join("|")}\b`), token: "variable-3" },
                { regex: new RegExp(`${eRE(atoms).join("|")}\b`), token: "atom" },
                { regex: new RegExp(`${eRE(symbols).join("|")}\b`), token: "def" },
                { regex: /[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number" },
                { regex: new RegExp(`${eRE(line_comment)}.*`), token: "comment" },
        
                { regex: new RegExp(`${eRE(operators).join("|")}\b`), token: "operator" }
            ],
            meta: {
                lineComment: line_comment || "//"
            }
        })
    });
}