import ContentWindow from "../scripts/commonWindows/Content";
import uuidv4 from "uuid/v4";
import TabSystem from "../scripts/TabSystem";
import { JSONAction } from "../scripts/TabSystem/CommonHistory";

export default class EditMoLangWindow extends ContentWindow {
    constructor(moLang, node_context) {
        super({
            display_name: "Edit MoLang",
            options: {
                is_persistent: false,
                is_maximizable: false,
                height: 316
            },
            content: [
                {
                    type: "codemirror",
                    key: uuidv4(),
                    input: moLang.replace(/\; /g, ";\n"),
                    file_path: "@/molang/fake",
                    options: {
                        lineNumbers: true,
                        line: true,
                        autoCloseBrackets: true,
                        styleActiveLine: true,
                        showCursorWhenSelecting: true,

                        mode: "molang"
                    },
                    action: (val) => {
                        val = val.split(/\n/g).filter(e => e !== '').join("\n");
                        this.input = val.replace(/\s\.\s/g, ".").replace(/\;\n/g, "; ").replace(/\n/g, "; ");
                    }
                }
            ],
            actions: [
                {
                    type: "space"
                },
                {
                    type: "button",
                    text: "Edit!",
                    color: "success",
                    is_rounded: true,
                    action: () => {
                        TabSystem.getHistory().add(new JSONAction("edit-data", node_context, node_context.data));
                        node_context.edit(this.input);
                        TabSystem.setCurrentUnsaved();
                        this.close();
                    }
                }
            ]
        });

        this.input = moLang.replace(/\; /g, ";\n");
    }
}