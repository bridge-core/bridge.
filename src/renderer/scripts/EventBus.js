let events = {};
export default class {
    static on(event, cb) {
        if(event in events) events[event].push(cb);
        else events[event] = [cb];
        // console.log("Registered event " + event);
    }

    static off(event, cb) {
        if(cb == undefined) {
            events[event] = [];
        } 
        else {
            for(let i = 0; i < events[event].length; i++) {
                if(events[event][i] === cb) {
                    console.log(events[event].splice(i, 1));
                    return;
                }
            }
        }
        // console.log("Unregistered event " + event);
    }

    static trigger(event, ...data) {
        if(event in events) {
            events[event].forEach(e => {
                e(...data);
            });
        }
        // console.log("[EVENT] " + event);
    }
}