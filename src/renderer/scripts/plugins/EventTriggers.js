// @ts-check
import Runtime from "./Runtime";
import PluginAssert from "./PluginAssert";

/**
 * Triggers a plugin event and returns return value of the cbs
 * @param {String} name Event to trigger
 * @param {any} arg Data to give to cb
 * @param {Boolean} init Whether to initialize the return value with "arg"
 */
export function trigger(name, arg, init=true) {
    if(Runtime.Listeners.get(name)) {
        let new_arg = init ? arg : {};
        Runtime.Listeners.get(name).forEach(cb => {
            let res;
            try { 
                res = cb(init ? new_arg : arg) 
            } catch(err) {
                PluginAssert.throw("Event: " + name, err);
                res = {};
            }

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
    return arg;
}

export function booleanAnyOfTrigger(name, ...args) {
    let trigger = false;
    try {
        Runtime.Listeners.get(name).forEach(cb => trigger = trigger || cb(...args));
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
export function overwriteTrigger(name, arg) {
    let new_arg = arg;
    let listeners = Runtime.Listeners.get(name);
    if(listeners) {
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
export function readonlyTrigger(name, arg) {
    let listeners = Runtime.Listeners.get(name);
    if(listeners) {
        return listeners.forEach(l => l(arg));
    }
}