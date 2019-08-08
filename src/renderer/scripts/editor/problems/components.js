//@ts-check
//Components
import TwoIncompatible from "./components/TwoIncompatible";
import NeedsBoth from "./components/NeedsBoth";
import NeedsThree from "./components/NeedsThree";
import NeedsThreeIfBoth from "./components/NeedsThreeIfBoth";
import FirstNeedsSecond from "./components/FirstNeedsSecond";
import FindOne from "./components/FindOne";
import ChildMustStartWith from "./components/ChildMustStartWith";
import ChildMustBeNumber from "./components/ChildMustBeNumber";
import EventCheck from "./components/EventCheck";
import BehaviorCheck from "./components/BehaviorCheck";
import FormatVersionCheck from "./components/FormatVersionCheck";
import AnimationCheck from "./components/AnimationCheck";
import EntityGroupCheck from "./components/GroupCheck";
import FileType from "../FileType";

const MAP = {
    "bridge:two_incompatible": TwoIncompatible,
    "bridge:first_needs_second": FirstNeedsSecond,
    "bridge:needs_both": NeedsBoth,
    "bridge:needs_three": NeedsThree,
    "bridge:needs_three_if_both": NeedsThreeIfBoth,
    "bridge:find_one": FindOne,
    "bridge:child_must_start_with": ChildMustStartWith,
    "bridge:child_must_be_number": ChildMustBeNumber,
    "bridge:event_check": EventCheck,
    "bridge:entity_group_check": EntityGroupCheck,
    "bridge:behavior_check": BehaviorCheck,
    "bridge:animation_check": AnimationCheck,
    "bridge:format_version_check": FormatVersionCheck
};

//Load
let PROBLEM_STORE = {};
let loaded = false;

async function loadStore() {
    const DEF = await FileType.getProblems();
    
    for(let file_type in DEF) {
        PROBLEM_STORE[file_type] = [];
    
        for(let key in DEF[file_type]) {
            let current = DEF[file_type][key];
            if(MAP[key] === undefined) throw new Error("Unknown component: " + key);
    
            if(Array.isArray(current)) {
                current.forEach(e => PROBLEM_STORE[file_type].push(new MAP[key](e)));
            } else {
                PROBLEM_STORE[file_type].push(new MAP[key](current));
            }
        }
    }
    return PROBLEM_STORE;
}

export default async () => {
    if(loaded) return PROBLEM_STORE;

    loaded = true;
    return await loadStore();
};
