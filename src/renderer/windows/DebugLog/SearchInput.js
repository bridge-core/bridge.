import InputWindow from "../../scripts/commonWindows/Input";
import SearchListView from "./SearchListView";

export default class SearchDebugLogInput extends InputWindow {
    constructor(parent) {
        super({
            header: "Search Debug Log",
            label: "Search"
        },
        (val) => {
            console.log(val);
            if(parent) parent.close();
            new SearchListView(val);
        });
    }
}