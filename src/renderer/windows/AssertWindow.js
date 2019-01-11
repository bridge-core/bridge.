import ContentWindow from "../scripts/commonWindows/Content";

export default class AssertWindow extends ContentWindow {
    constructor(plugin_id, assert_msg) {
        super({
            display_name: "Assert",
            options: {
                is_frameless: true,
                main_color: "error darken-1",
                height: 150
            },
            content: [
                {
                    type: "header",
                    text: `ASSERT: ${plugin_id}`
                },
                {
                    type: "divider"
                },
                {
                    text: `\n${assert_msg}`
                }
            ],
            actions: [
                {
                    type: "space"
                },
                {
                    type: "button",
                    text: "Okay",
                    color: "error darken-2",
                    action: () => {
                        this.close();
                    }
                }
            ]
        }, `bridge.core.plugin_assert.${plugin_id}.`);
    }
}