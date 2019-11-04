import ContentWindow from "../../scripts/commonWindows/Content";
import LogCard from "./LogCard";
import Title from "./Title";
import { processedDebugLog } from "../../scripts/features/debugLog";
import SearchDebugLogInput from "./SearchInput";
import { PAGE_SIZE } from "./Common";

export default class LogListView extends ContentWindow {
    constructor(tag_filter, from=0) {
        super({
            display_name: tag_filter ? `Debug Log | Filter: ${tag_filter.toUpperCase()}` : "Debug Log",
            options: {
                is_persistent: false,
                is_maximizable: false,
                blurs_background: true,
                elevation: 0
            },
            toolbar: [
                {
                    display_name: "Search",
                    display_icon: "mdi-magnify",
                    action: () => {
                        new SearchDebugLogInput(this);
                    }
                }
            ],
            content: [
                {
                    type: "loader"
                }
            ]
        }, "bridge.debug_log.");

        const BASE = [{ text: "\n" }];
        if(tag_filter) {
            BASE.push(...Title(tag_filter));
        }

        processedDebugLog()
            .then(logs => {
                if(tag_filter)
                    logs = logs.filter(({ tags }) => tags.includes(tag_filter));

                if(logs.length === 0)
                    BASE.push({ text: "Unable to find debug log files." });

                BASE.push(
                    ...logs
                        .map(log => [ new LogCard(this, log), { text: "\n\n" } ])
                        .flat()
                        .slice(from, from + PAGE_SIZE)
                );
                this.actions = [
                    { type: "space" },
                    {
                        text: `${ (from / PAGE_SIZE) + 1 }/${ Math.ceil(logs.length / PAGE_SIZE) }`
                    },
                    {
                        type: "icon-button",
                        only_icon: true,
                        text: "mdi-chevron-left",
                        is_disabled: from === 0,
                        action: () => {
                            this.close();
                            new LogListView(tag_filter, from - PAGE_SIZE);
                        }
                    },
                    {
                        type: "icon-button",
                        only_icon: true,
                        text: "mdi-chevron-right",
                        is_disabled: from + PAGE_SIZE > logs.length,
                        action: () => {
                            this.close();
                            new LogListView(tag_filter, from + PAGE_SIZE);
                        }
                    }
                ];
                this.content = BASE;
                this.update();
            })
        
    }

    set content(val) {
        this.win_def.content = val;
    }
    get content() {
        return this.win_def.content;
    }

    set actions(val) {
        this.win_def.actions = val;
    }
    get actions() {
        return this.win_def.actions;
    }
}