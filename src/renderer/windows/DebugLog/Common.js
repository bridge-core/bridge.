import { readJSONSync } from "../../scripts/utilities/JsonFS";
import path from "path";

export const LOG_TAG_MAP = readJSONSync(path.join(__static, "data/log_tag_map.json"));

export function tag(tag_name) {
    return  (LOG_TAG_MAP[tag_name] || {});
}