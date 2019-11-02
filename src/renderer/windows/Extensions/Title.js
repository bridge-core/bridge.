import { tag } from "./Common";

export default function Title(tag_filter) {
    return [
        { 
            type: "container",
            display: "inline-block",
            content: [
                { type: "icon", text: tag(tag_filter).icon, color: tag(tag_filter).color },
                { text: "  " },
                { type: "big-header", text: tag_filter }
            ] 
        },
        { type: "divider" },
        { text: "\n" }
    ];
}