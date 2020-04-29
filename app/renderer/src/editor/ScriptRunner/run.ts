export function prepareRun(code: string) {
	if (code === undefined) return () => {}
	try {
		return function(b: unknown) {
			this.Bridge = b
			return eval(
				code
					.replace(/Bridge\./g, 'this.Bridge.')
					.replace(/=( )*Bridge/g, '= this.Bridge')
			)
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
