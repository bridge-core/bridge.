import ContentWindow from "../../scripts/commonWindows/Content";
import LogCard from "./LogCard";
import Title from "./Title";
import { processedDebugLog } from "../../scripts/Sidebar/DebugLog";
import SearchDebugLogInput from "./SearchInput";
import { PAGE_SIZE } from "./Common";

export default class SearchListView extends ContentWindow {
    constructor(search_filter, from=0) {
        super({
            display_name: search_filter ? `Debug Log | Search: ${search_filter.toUpperCase()}` : "Debug Log",
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
        }, "bridge.debug_log_search_list.");

        const BASE = [{ text: "\n" }];
        if(search_filter) {
            BASE.push(...Title(search_filter));
        }

        processedDebugLog()
            .then(logs => {
                if(search_filter)
                    logs = logs.filter(({ tags, error }) => tags.includes(search_filter) || error.includes(search_filter));
                
                if(logs.length === 0)
                    BASE.push({ text: "No logs are matching your search." });

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
                        text: "mdi-chevron-left",
                        only_icon: true,
                        is_disabled: from === 0,
                        action: () => {
                            this.close();
                            new LogListView(search_filter, from - PAGE_SIZE);
                        }
                    },
                    {
                        type: "icon-button",
                        text: "mdi-chevron-right",
                        only_icon: true,
                        is_disabled: from + PAGE_SIZE > logs.length,
                        action: () => {
                            this.close();
                            new LogListView(search_filter, from + PAGE_SIZE);
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