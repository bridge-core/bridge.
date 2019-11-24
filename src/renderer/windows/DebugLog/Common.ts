import { readJSONSync } from "../../scripts/utilities/JsonFS";
import path from "path";

declare var __static: string;

export const LOG_TAG_MAP: { [s: string]: { icon: string; color: string; } } = readJSONSync(path.join(__static, "data/log_tag_map.json"));
export const PAGE_SIZE = 30;
export function tag(tag_name: string): { icon?: string; color?: string; } {
    return  (LOG_TAG_MAP[tag_name] || {});
}