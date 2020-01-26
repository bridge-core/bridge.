/**
 * Utility for triggering and reacting to events
 */

interface eventStorage {
	[x: string]: eventCB[]
}
interface eventCBObj {
	cb: (...a: any) => any
	consume: boolean
}
type eventCB = eventCBObj | ((...a: any) => any)

let events: eventStorage = {}
export default class EventBus {
	static on(event: string, cb: eventCB) {
		if (event in events) events[event].push(cb)
		else events[event] = [cb]
		// console.log("Registered event " + event, events);
	}

	static off(event: string, cb: eventCB) {
		if (cb === undefined) {
			events[event] = []
		} else {
			for (let i = 0; i < events[event].length; i++) {
				if (events[event][i] === cb) return events[event].splice(i, 1)
			}
		}
		// console.log("Unregistered event " + event);
	}

	static once(event: string, cb: () => any) {
		this.on(event, { cb, consume: true })
		// console.log("Once event registered " + event);
	}

	static trigger(event: string, ...data: any[]) {
		let res = []
		let off: eventCBObj[] = []
		if (event in events) {
			for (let e of events[event]) {
				if (typeof e === 'object') {
					res.push(e.cb(...data))
					if (e.consume) off.push(e)
				} else {
					res.push(e(...data))
				}
			}
		}
		// console.log("[EVENT] " + event, res);
		off.forEach(o => this.off(event, o))
		return res.flat()
	}
}
