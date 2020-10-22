declare module 'prismarine-nbt' {
	export interface Packet {
		type: string
		name: string
		value: Packet | Packet[] | string | number | boolean
	}
	export function parse(
		data: Buffer,
		littleEndian: boolean,
		callback: (error: Error, data: Packet) => void
	): void
	export function writeUncompressed(
		data: Packet,
		littleEndian: boolean
	): Buffer
	export function parseUncompressed(
		data: Buffer,
		littleEndian: boolean
	): Packet
	export function simplify(data: Packet): any
}
