import ContentWindow from "../scripts/commonWindows/Content";
import uuidv4 from "uuid/v4";

export default class EditMoLangWindow extends ContentWindow {
    constructor(moLang) {
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
                    input: moLang,
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
                        this.input = val;
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
                    action: () => {}
                }
            ]
        });

        this.input = moLang;
    }
}