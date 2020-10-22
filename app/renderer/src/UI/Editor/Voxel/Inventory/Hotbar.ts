import Vue from 'vue'

export const HotbarState = Vue.observable([10, 400, 67, 123, 325])
export function setHotbarSlot(slotId: number, blockId: number) {
	Vue.set(HotbarState, slotId, blockId)
}

export const select = (slotId: number) => {
	if (slotId === 0) return

	const tmp = HotbarState[slotId]
	Vue.set(HotbarState, slotId, HotbarState[0])
	Vue.set(HotbarState, 0, tmp)
}
export const getSelected = () => {
	return HotbarState[0]
}
