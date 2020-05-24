export {}

declare global {
	namespace NodeJS {
		interface Global {
			__static: string
		}
	}
}
