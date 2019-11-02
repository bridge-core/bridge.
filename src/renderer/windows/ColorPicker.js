import ContentWindow from "../scripts/commonWindows/Content";


export default class ColorPicker extends ContentWindow {
    constructor(color, onInput) {
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
                    input: color,
                    is_rounded: false,
                    action: (val) => {
                        this.color_val = val;
                    }
                }
            ],
            onClose: () => {
                this.close();
                if(typeof onInput === "function") onInput(this.color_val);
            }
        });
        this.color_val = color;
    }
}