import { JSONFileMasks } from "../editor/JSONFileMasks";
import FetchDefinitions from "../editor/FetchDefinitions";

export function transformTag(data) {
    let tag = data["bridge:tag"];
    if(!tag) return {};

    let { description: { identifier, ...description }, ...entity } = tag;
    return {
        identifier,
        "minecraft:entity": { description, ...entity }
    };
}

export default async function TagHandler({ file_path, data, depth }) {
    let tag = data["bridge:tag"];
    if(!tag) return;

    let { description: { identifier, ...description }, ...entity } = tag;
    if(!identifier) return;

    let refs = await FetchDefinitions.fetchSingle("entity", [ "bridge_core_tags" ], identifier, true);
    await Promise.all(refs.map(async f => {
        const MASK = await JSONFileMasks.get(f);
        MASK.set(`tag@${identifier}`, {
            "minecraft:entity": { description, ...entity }
        });
        await JSONFileMasks.apply(f, depth - 1);
    })).catch(console.error);
}