import Runtime from "./Runtime";

export function trigger(name, arg) {
    if(Runtime.Listeners.get(name)) {
        let new_arg = arg;
        Runtime.Listeners.get(name).forEach(cb => {
            let res = cb(new_arg);

            if(res) {
                try {
                    new_arg = Object.assign(arg, res);
                } catch (e) {
                    console.warn(e);
                }
            }
        });
        return new_arg;
    }
    return arg;
}
export function overwriteTrigger(name, arg) {
    let new_arg = arg;
    let listeners = Runtime.Listeners.get(name);
    if(listeners) {
        let cb = listeners[listeners.length -1];
        new_arg = cb(new_arg);
    }
    return new_arg;
}
export function readonlyTrigger(name, arg) {
    let listeners = Runtime.Listeners.get(name);
    if(listeners) {
        return listeners[listeners.length -1](arg);
    }
}