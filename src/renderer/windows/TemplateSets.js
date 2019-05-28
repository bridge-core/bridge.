import FileSystem from "../scripts/FileSystem";
import TabWindow from "../scripts/commonWindows/TabWindow";
import safeEval from "safe-eval";
import { RP_BASE_PATH, BASE_PATH } from "../scripts/constants";
import { getTemplateSets, loadTemplateSets } from "../scripts/TemplateSets";
import fs from "fs";
import Store from "../store/index";
import findRP from "../scripts/utilities/FindRP";
import mkdirp from "mkdirp";
import LoadingWindow from "./LoadingWindow";
import InformationWindow from "../scripts/commonWindows/Information";
import EventBus from "../scripts/EventBus";

loadTemplateSets();
let SETS;
let L_W;

EventBus.on("bridge:changedProject", async () => {
    let project = await findRP();
    if(project === "/@NO-DEPENDENCY@/" || project === "/@NO-RP@/")
        project = undefined;
    Store.commit("setExplorerProject", { store_key: "resource_pack", project });
});

function evalFile(str, bindings) {
    for(let key in {
        ...bindings,
        RP: RP_BASE_PATH + (Store.state.Explorer.project.resource_pack || "uncategorized"),
        BP: BASE_PATH + Store.state.Explorer.project.explorer
    }) {
        str = str.replace(new RegExp(`\\$${key}`, "g"), bindings[key]);
    }
    return str;
}

async function evalStatement(str, bindings) {
    if(Store.state.Explorer.project.resource_pack === undefined) {
        let project = await findRP();
        if(project === "/@NO-DEPENDENCY@/" || project === "/@NO-RP@/")
            project = undefined;
        Store.commit("setExplorerProject", { store_key: "resource_pack", project });
    }
        
    return safeEval(str, {
        ...bindings,
        RP: RP_BASE_PATH + (Store.state.Explorer.project.resource_pack || "uncategorized"),
        BP: BASE_PATH + Store.state.Explorer.project.explorer
    });
}

function parseDefine(path, as, bindings, cb) {
    fs.readFile(`${__static}\\template_sets\\${path}`, async (err, data) => {
        // console.log(await evalStatement(as, bindings));
        if(err) 
            throw err;
        else {
            let path = await evalStatement(as, bindings);
            let folder = path.split(/\\|\//g);
            folder.pop();
            folder = folder.join("\\");

            mkdirp.sync(folder);
            fs.writeFile(
                path,
                evalFile(data.toString(), bindings), 
                (err) => { if(err) throw err; if(typeof cb === "function") cb(); }
            );
        }        
    });
}

class TemplateSetsWindow extends TabWindow {
    constructor() {
        super("Template Sets", { is_visible: false, is_persistent: false }, "bridge.core.template_sets.window." + Math.random());
        SETS = getTemplateSets();
        this.BINDINGS = {};
        this.REQUIRED_BINDINGS = [];

        SETS.forEach(({ icon, title, inputs, selects }) => {
            this.addTab({
                sidebar_element: {
                    icon,
                    title
                },
                content: [
                    ...(inputs ? inputs.map(({ label, bind, default_input, extend }) => {
                        return {
                            type: "horizontal",
                            center: true,
                            content: [
                                {
                                    type: "input",
                                    text: label,
                                    input: default_input,
                                    action: (val) => this.BINDINGS[bind] = val
                                },
                                (extend ? { text: extend, color: "grey" } : {})
                            ]
                        }
                    }) : []),
                    ...(selects ? selects.map(({ label, options, bind }) => {
                        return [
                            (label ? { text: "\n" + label, color: "grey" } : {}),
                            {
                                type: "select",
                                text: options[0],
                                options,
                                action: (val) => this.BINDINGS[bind] = val
                            }
                        ]
                    }).reduce((acc, curr) => acc.concat(curr), []) : [])
                ]
            });
        });

        this.win_def.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                is_rounded: true,
                color: "success",
                text: "Create!",

                action: () => {
                    let { define } = SETS[this.selected_tab];
                    if(define === undefined || !this.inputsFilled())
                        return new InformationWindow("Inputs", "\nNot all required inputs are filled.");
                    
                    this.close();
                    L_W = new LoadingWindow("template_set.").show();
                    let total_created = 0;
                    define.forEach(async ({ filter, path, as }) => {
                        if(filter !== undefined) {
                            filter.forEach(async ({ path, as, condition }) => {
                                if(condition === undefined || await evalStatement(condition, this.BINDINGS)) 
                                    parseDefine(path, as, this.BINDINGS, () => {
                                        total_created++;
                                        if(this.BINDINGS.length <= total_created) L_W.close();
                                    });
                            });
                        } else {
                            parseDefine(path, as, this.BINDINGS, () => {
                                total_created++;
                                if(this.BINDINGS.length <= total_created) L_W.close();
                            });
                        }
                        
                    });
                }
            }
        ];

        this.update();
    }

    select(id, force_update) {
        this.BINDINGS = {};

        let { inputs, selects } = SETS[id];
        //Set select default value
        if(selects !== undefined) {
            selects.forEach(({ options, bind }) => {
                this.BINDINGS[bind] = options[0]; 
            });
        }
        //Set inputs as required (and default value if given)
        if(inputs !== undefined) {
            inputs.forEach(({ bind, default_input }) => {
                if(default_input) this.BINDINGS[bind] = default_input;
                this.REQUIRED_BINDINGS.push(bind);
            });
        }

        super.select(id, force_update);
    }

    inputsFilled() {
        for(let b of this.REQUIRED_BINDINGS) {
            if(this.BINDINGS[b] === undefined || this.BINDINGS[b] === "") return false;
        }
        return true;
    }
}

let WIN;
export default {
    show: () => {
        try {
            WIN.show();
        } catch(e) {
            WIN = new TemplateSetsWindow();
        }
    }
}