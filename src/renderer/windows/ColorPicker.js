import ContentWindow from "../scripts/commonWindows/Content";
import TabSystem from "../scripts/TabSystem";
import { JSONAction } from "../scripts/TabSystem/CommonHistory";

export default class ColorPicker extends ContentWindow {
    constructor(node_context) {
        super({
            display_name: "Color Picker",
            options: {
                is_draggable: false,
                is_persistent: false,
                blurs_background: true,
                is_maximizable: false,
                height: 320,
                width: "fit-content",
                no_padding: true
            },
            content: [
                {
                    type: "color-picker",
                    input: node_context.data,
                    is_rounded: false,
                    action: (val) => {
                        TabSystem.getHistory().add(new JSONAction("edit-data", node_context, node_context.data));
                        TabSystem.setCurrentUnsaved();
                        node_context.edit(val);
                    }
                }
            ]
        });
    }
}