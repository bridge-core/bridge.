declare module 'font-list' {
	namespace FontList {
		export function getFonts(): Promise<string[]>
	}

	export default FontList
}
