// @ts-check
import Runtime from "./Runtime";
import PluginAssert from "./PluginAssert";

/**
 * Triggers a plugin event and returns return value of the cbs
 * @param {String} name Event to trigger
 * @param {any} arg Data to give to cb
 * @param {Boolean} init Whether to initialize the return value with "arg"
 */
export function trigger(name: string, arg?: any, init=true) {
    let listeners = Runtime.Listeners.get(name);
    if(Array.isArray(listeners)) {
        let new_arg = init ? arg : {};
        listeners.forEach((cb: any) => {
            let res;
            try { 
                res = cb(init ? new_arg : arg);
            } catch(err) {
                PluginAssert.throw("Event: " + name, err);
                res = {};
            }
            console.log(res)
            if(res) {
                try {
                    new_arg = Object.assign(new_arg, res);
                } catch (e) {
                    PluginAssert.throw(name, e);
                    console.warn(e);
                }
            }
        });
        return new_arg;
    }
    return init ? arg : {};
}

export function booleanAnyOfTrigger(name: string, ...args: any[]) {
    let trigger = false;
    try {
        let listeners = Runtime.Listeners.get(name);
        if(Array.isArray(listeners))
            listeners.forEach((cb: any) => trigger = trigger || cb(...args));
    } catch(err) {
        PluginAssert.throw("Event: " + name, err)
    }
    
    return trigger;
}


/**
 * Triggers the last registered plugin event
 * @param {String} name Event to trigger
 * @param {any} arg Data to give to cb
 */
export function overwriteTrigger(name: string, arg: any) {
    let new_arg = arg;
    let listeners = Runtime.Listeners.get(name);
    if(Array.isArray(listeners)) {
        let cb = listeners[listeners.length -1];
        new_arg = cb(new_arg);
    }
    return new_arg;
}
/**
 * Readonly trigger. Objects may still be modified
 * @param {String} name Event to trigger
 * @param {any} arg Data to give to cb
 */
export function readonlyTrigger(name: string, arg?: any) {
    let listeners = Runtime.Listeners.get(name);
    if(Array.isArray(listeners)) {
        return listeners.forEach((l: any) => l(arg));
    }
}