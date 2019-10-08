let events = {};
export default class EventBus {
    static on(event, cb) {
        if(event in events) events[event].push(cb);
        else events[event] = [cb];
        // console.log("Registered event " + event, events);
    }

    static off(event, cb) {
        if(cb === undefined) {
            events[event] = [];
        } 
        else {
            for(let i = 0; i < events[event].length; i++) {
                if(events[event][i] === cb)
                    return events[event].splice(i, 1);
            }
        }
        // console.log("Unregistered event " + event);
    }

    static once(event, cb) {
        this.on(event, { cb, consume: true });
        // console.log("Once event registered " + event);
    }

    static trigger(event, ...data) {
        let res = [];
        let off = [];
        if(event in events) {
            for(let e of events[event]) {
                if(typeof e === "object") {
                    res.push(e.cb(...data));
                    if(e.consume) off.push(e);
                } else {
                    res.push(e(...data));
                }
            }
        }
        // console.log("[EVENT] " + event, res);
        off.forEach(o => this.off(event, o));
        return res.flat();
    }
}