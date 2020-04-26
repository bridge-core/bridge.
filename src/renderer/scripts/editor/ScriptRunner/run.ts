export function prepareRun(code: string) {
	try {
		return function(Bridge: unknown) {
			this.Bridge = Bridge
			return eval(code)
		}
	} catch (err) {
		throw err
	}
}
export const run = (code: string, env: unknown) => {
	return prepareRun(code).call({}, env)
}

export const runFunction = (
	func: (Bridge: unknown) => unknown,
	env: unknown
) => {
	return func.call({}, env)
}
