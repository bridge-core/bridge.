import FileSystem from "../scripts/FileSystem";
import TabWindow from "../scripts/commonWindows/TabWindow";
import Store from "../store/index";
import FileType from "../scripts/editor/FileType";
import safeEval from "safe-eval";
import { RP_BASE_PATH, BASE_PATH } from "../scripts/constants";
import { getTemplateSets, loadTemplateSets } from "../scripts/TemplateSets";
loadTemplateSets();

class TemplateSetsWindow extends TabWindow {
    constructor() {
        super("Template Sets", { is_visible: false, is_persistent: false }, "bridge.core.template_sets.window." + Math.random());
        let SETS = getTemplateSets();

        SETS.forEach(({ icon, title, inputs, selects, ...s }) => {
            console.log(s);
            this.addTab({
                sidebar_element: {
                    icon,
                    title
                },
                content: [
                    ...(inputs ? inputs.map(({ label }) => {
                        return {
                            type: "input",
                            text: label
                        }
                    }) : []),
                    ...(selects ? selects.map(({ label, options }) => {
                        return [
                            (label ? { text: "\n" + label, color: "grey" } : {}),
                            {
                                type: "select",
                                text: options[0],
                                options
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
                text: "Create!"
            }
        ];

        this.update();
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