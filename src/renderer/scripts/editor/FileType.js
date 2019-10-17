/**
 * Base class for managing and accessing data-driven features
 */
import TabSystem from "../TabSystem";
import Provider, { LIB_LOADED } from "../autoCompletions/Provider";
import fs from "fs";
import { join } from "path";
import { readJSON, readJSONSync } from "../utilities/JsonFS";
import eRE from "../utilities/EscapeRegExp";

let FILE_DEFS;
let HIGHLIGHTER_CACHE = {};
let FILE_CREATOR_CACHE = [];

export default class FileType {
    static reset() {
        FILE_DEFS = undefined;
        FILE_CREATOR_CACHE = [];
    }
    static get LIB_LOADED() {
        return LIB_LOADED;
    }

    //Special method to e.g. avoid "loot_tables/blocks/something.json" being considered a "block"
    static pathIncludes(path, includes) {
        try {
            path = path.split(/development_behavior_packs|development_resource_pack/g)[1].split(/\\|\//g);
            path.shift();
            path.shift();
            path = path.join("/");

            return path.startsWith(includes);
        } catch(e) {
            // console.log(path, includes,path.includes(includes));
            return path.includes(includes);
        }
    }
    //Load files which aren't in a "development_behavior_packs" folder correctly
    static fallbackToBP(path) {
        return path.split(/development_behavior_packs|development_resource_pack/g)[1] === undefined;
    }

    static get(file_path) {
        let data = this.getData(file_path);
        if(data === undefined) return "unknown";
        return data.id || "unknown";
    }

    static getData(file_path, file_type) {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        let path = file_path;
        
        if(path === undefined) {
            try {
                path = TabSystem.getSelected().file_path;
            } catch(e) { return; }
        }

        
        for(let def of FILE_DEFS) {
            // console.log(path);
            if(
                file_type === def.id
                || this.pathIncludes(path, def.includes)
                && (
                    path.includes("development_behavior_packs")
                    || def.rp_definition
                    || this.fallbackToBP(path)
                )
            )
                return def;
        }
    }

    static getAll() {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        return FILE_DEFS.map(def => def.id);
    }
    static getAllData() {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        return FILE_DEFS;
    }

    static getFileCreator() {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        if(FILE_CREATOR_CACHE.length === 0) {
            FILE_CREATOR_CACHE = FILE_DEFS.reduce((acc, file) => {
                if(file.file_creator !== undefined) {
                    if(typeof file.file_creator === "string")
                        acc.push({
                            rp_definition: file.rp_definition,
                            ...JSON.parse(fs.readFileSync(join(__static, "file_creator", `${file.file_creator}.json`)).toString())
                        });
                    else
                        acc.push({
                            rp_definition: file.rp_definition,
                            ...file.file_creator
                        });
                }
                return acc;
            }, []);
        }
        return FILE_CREATOR_CACHE;
    }

    static getFileIcon(file_path) {
        const { file_creator } = this.getData(file_path) || {};

        if(file_creator !== undefined) {
            if(typeof file_creator === "string")
                return readJSONSync(join(__static, "file_creator", `${file_creator}.json`)).icon;
            else
                return file_creator.icon;
        }
    }

    static getHighlighter(data=this.getData()) {
        try {
            let hl = data.highlighter;
            if(typeof hl === "object")
                return hl;
            if(HIGHLIGHTER_CACHE[hl] === undefined)
                HIGHLIGHTER_CACHE[hl] = JSON.parse(fs.readFileSync(join(__static, "highlighter", `${hl}.json`)).toString());
            return HIGHLIGHTER_CACHE[hl];
        } catch(e) {
            return {
                define: {
                    keywords: [],
                    symbols: [],
                    titles: []
                }
            };
        }
    }
    static getTextHighlighters() {
        let defs = this.getAllData();
        defs = defs.filter(({ highlighter: hl }) => {
            try {
                if(typeof hl === "object")
                    return hl;
                if(HIGHLIGHTER_CACHE[hl] === undefined)
                    HIGHLIGHTER_CACHE[hl] = JSON.parse(fs.readFileSync(join(__static, "highlighter", `${hl}.json`)).toString());
                return HIGHLIGHTER_CACHE[hl].set.is_text_highlighter;
            } catch(e) {
                return false;
            }
        });

        return defs.map(def => this.getHighlighter(def));
    }

    static DefaultBuildArrays(file_path) {
        try {
            return this.getData(file_path).default_build_arrays;
        } catch(e) {
            return false;
        }
    }

    static getDocumentation(file_path) {
        return (this.getData(file_path) || {}).documentation;
    }

    static async getSnippets() {
        let file_types = this.getAllData();
        let snippet_data = {};
        let proms = [];

        for(let { id, snippets } of file_types) {
            if(snippets === undefined) continue;
            proms.push(
                readJSON(join(__static, "snippets", `${snippets}.json`))
                    .then(data => snippet_data[id] = data)
            );
        }

        await Promise.all(proms);
        return snippet_data;
    }
    static async getProblems() {
        let file_types = this.getAllData();
        let data = {};
        let proms = [];

        for(let { problems, id } of file_types) {
            if(problems === undefined) continue;
            data[id] = {};
            if(Array.isArray(problems))
                problems.forEach(
                    problem => proms.push(
                        readJSON(join(__static, "problems", `${problem}.json`))
                            .then(p => Object.assign(data[id], p))
                    )
                );
            else
                proms.push(readJSON(join(__static, "problems", `${problems}.json`)).then(p => data[id] = p)) 
        }
        
        await Promise.all(proms);
        return data;
    }

    static async getLightningCacheDefs(file_path, file_type) {
        let data = this.getData(file_path, file_type);
        if(data === undefined || data.lightning_cache === undefined) return;

        return await readJSON(join(__static, "lightning_cache", `${data.lightning_cache}.json`));
    }

    static transformTextSeparators(file_path, text) {
        try {
            let { text_separators } = this.getData(file_path);
            text_separators.forEach(s => text = text.replace(new RegExp(eRE(s), "g"), (val) => ` ${val} `));
            return text;
        } catch(e) {
            return text;
        }
    }

    static getCommentChar(file_path) {
        try {
            return this.getData(file_path).comment_character || "//";
        } catch(e) {
            return "//";
        }
    }

    static getCommentChars() {
        return this.getAllData()
            .map(({ comment_character }) => comment_character)
            .filter(c => c !== undefined)
            .concat([ "//" ]);
    }
}