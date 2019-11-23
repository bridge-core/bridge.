import { JSONFileMasks } from "../editor/JSONFileMasks";
import FetchDefinitions from "../editor/FetchDefinitions";
import { OnSaveData } from "./main";
import AnimationController from "../files/AnimationController";
import { join } from "path";
import { CURRENT } from "../constants";
import { set } from "../utilities/useAttr";
let A_C: AnimationController;


function generateTransArg(from: number[], to: number[]) {
    let str = "";
    for(let i = 0; i < 3; i++)
        str += `query.get_position(${i}) >= ${from[i] || 0} && `;
    for(let i = 0; i < 3; i++)
        str += `query.get_position(${i}) <= ${to[i] || 0} && `;
    
    return str.substring(0, str.length - 4);
}

export default async function MapAreaHandler({ file_path, data, depth, file_uuid }: OnSaveData) {
    let map_area = data["bridge:map_area"];
    if(!map_area) return;

    let { 
        description: { 
            identifier,
            subjects,
            area: {
                from = [0, 0, 0],
                to = [0, 0, 0]
            } = {}
        },
        components: { 
            "bridge:timer": timer = {},
            "bridge:area_sensor": area_sensor = {}
        } = {}
    } = map_area;
    if(!identifier || !Array.isArray(subjects) || !Array.isArray(to) || !Array.isArray(from)) return;
    
    A_C = new AnimationController();
    let refs = (await Promise.all(subjects.map(s => FetchDefinitions.fetchSingle("entity", [ "identifiers" ], s, true)))).flat();
    identifier = identifier.replace(":", "_");

    await Promise.all(refs.map(async f => {
        const MASK = await JSONFileMasks.get(f);
        //SETUP PLAYER - RUN DEFAULT CONTROLLER
        MASK.overwrite(`map_area@${identifier}`, {
            "minecraft:entity": { 
                description: {
                    animations: {
                        [`map_area_${identifier}`]: `controller.animation.map_area.${identifier}`
                    },
                    scripts: {
                        animate: [ `map_area_${identifier}` ]
                    }
                }
            }
        });
        
        //BUILD DEFAULT CONTROLLER
        let trans_arg = generateTransArg(from, to)
        set(A_C, `animation_controllers/controller.animation.map_area.${identifier}/states`, {
            default: {
                transitions: [{ [`map_area_${identifier}`]: trans_arg }]
            },
            in_area: {
                transitions: [{ default: `!(${trans_arg})` }],
                on_entry: Object.values(area_sensor.on_enter || {}).filter(val => val !== undefined).flat(),
                on_exit: Object.values(area_sensor.on_leave || {}).filter(val => val !== undefined).flat()
            }
        });

        if(timer !== undefined) {
            //ADD TO CONTROLLER - RUN TIMER ANIMATION
            set(A_C, `animation_controllers/controller.animation.map_area.${identifier}/states/in_area`, {
                animations: [{ [`map_area_timer_${identifier}`]: timer.condition || "(1.0)" }]
            });
            //SETUP PLAYER - DEFINE TIMER ANIMATION
            MASK.set(`map_area_timer@${identifier}`, {
                "minecraft:entity": { 
                    description: {
                        animations: {
                            [`map_area_timer_${identifier}`]: `animation.map_area_timer.${identifier}`
                        }
                    }
                }
            });
        }

        await JSONFileMasks.apply(f, depth - 1);
    })).catch(console.error);

    await A_C.save(join(CURRENT.PROJECT_PATH, `animation_controllers/bridge/map_area_${file_uuid}`));
}