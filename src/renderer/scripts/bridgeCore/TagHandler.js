import JumpToDefinition from "../editor/JumpToDef";
import { JSONFileMasks } from "../editor/JSONFileMasks";
import LightningCache from "../editor/LightningCache";
import { PUSH_ONCE } from "../mergeUtils";


export default async function TagHandler({ file_path, data, depth }) {
    let tag = data["bridge:tag"];
    if(!tag) return;

    let { description, ...entity } = tag;
    let old_cache = await LightningCache.load(file_path, "entity");
    let CHANNEL_NAME = `tag@${typeof description.identifier === "string" ? description.identifier : "default"}`;
    let OLD_CHANNEL_NAME = `tag@${typeof (old_cache.identifiers || [])[0] === "string" ? old_cache.identifiers[0] : "default"}`;
    let SAVE = [];

    //RESET OLD MASKS
    let old_files = await Promise.all(old_cache.extends.map(async def => await JumpToDefinition.fetch([ "entity" ], def, true)));
    await Promise.all(old_files.flat().map(async f => {
        if(f === undefined) return;

        let MASK = await JSONFileMasks.get(f);
        MASK.reset(OLD_CHANNEL_NAME);

        SAVE = PUSH_ONCE(SAVE, [f]);
    })).catch(console.error);

    //CREATE NEW MASKS
    if(description !== undefined && description.extends !== undefined) {
        let files = await Promise.all(
            description.extends.map(
                async def => await JumpToDefinition.fetch([ "entity", "tag" ], def, true)
            )
        ).catch(console.error);

        await Promise.all(files.flat().map(async f => {
            if(f === undefined) return;
            delete description.extends;
            delete description.identifier;

            let MASK = await JSONFileMasks.get(f);
            MASK.set(CHANNEL_NAME, { "minecraft:entity": { description, ...entity } });
            if(data["minecraft:entity"] !== undefined)
                MASK.set(CHANNEL_NAME, { "minecraft:entity": data["minecraft:entity"] }, [], true);
            
            SAVE = PUSH_ONCE(SAVE, [f]);
        }));
    }

    await Promise.all(SAVE.map(async s => await JSONFileMasks.apply(s, depth - 1))).catch(console.error);
    await JSONFileMasks.saveMasks();
}