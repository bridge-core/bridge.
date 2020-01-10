import TabWindow from "../scripts/commonWindows/TabWindow";
import { loadPresets, buildPreset } from "../scripts/Presets";
import LoadingWindow from "./LoadingWindow";
import { uuid } from "../scripts/Utilities/useAttr";

export default class PresetWindow extends TabWindow {
    private action_button = {
        type: "button",
        text: "Create!",
        color: "primary",
        is_disabled: true,
        action: () => {}
    }
    private input = "";
    constructor() {
        super("Presets", { is_persistent: false }, "bridge.core.presets_window.");
        this.win_def.content = [
            {
                text: "\n"
            },
            {
                type: "loader"
            }
        ];
        this.win_def.actions = [
            {
                type: "space"
            },
            this.action_button
        ];
        this.update();
        this.init();
    }

    async init() {
        let data_arr = await loadPresets();

        data_arr
            .sort(({ manifest: { display_name: nameA }}, { manifest: { display_name: nameB } }) => nameA.localeCompare(nameB))
            .forEach(data => {
                this.addTab({
                    sidebar_element: {
                        icon: data.manifest.icon,
                        title: data.manifest.display_name
                    },
                    content: [
                        {
                            key: uuid(),
                            text: `\n${data.manifest.description || "No description provided!"}\n\n`
                        },
                        {
                            type: "input",
                            text: "Identifier",
                            key: uuid(),
                            action: {
                                default: (inp: string) => {
                                    this.input = inp;
    
                                    if(this.input === "") this.action_button.is_disabled = true;
                                    else this.action_button.is_disabled = false;
                                    this.update();
    
                                    this.action_button.action = async () => {
                                        this.close();
                                        let lw = new LoadingWindow();
                                        await buildPreset(data, this.input.toLowerCase());
                                        lw.close();
                                    }
                                },
                                enter: () => {
                                    if(this.input !== "") this.action_button.action();
                                }
                            }
                        },
                        {
                            key: uuid(),
                            text: "\nThe identifier will be used as a file name for all files this preset creates. It should not contain your namespace because bridge. adds it automatically where needed.\n"
                        },
                        {
                            key: uuid(),
                            text: "Example: \"test_preset\"",
                            color: "grey"
                        }
                    ]
                })
            });

        this.update();
    }

    select(id?: number, force_update?: boolean) {
        this.input = "";
        this.action_button.is_disabled = true;

        super.select(id, force_update);
    }
}