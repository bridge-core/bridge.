import Runtime from "./Runtime";

export function trigger(name, arg, init=true) {
    if(Runtime.Listeners.get(name)) {
        let new_arg = init ? arg : {};
        Runtime.Listeners.get(name).forEach(cb => {
            let res = cb(init ? new_arg : arg);

            if(res) {
                try {
                    new_arg = Object.assign(new_arg, res);
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
        return listeners.forEach(l => l(arg));
    }
}