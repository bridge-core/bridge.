export function prepareRun(code: string) {
	try {
		return function(Bridge: unknown) {
			return eval(code)
		}
	} catch (err) {
		throw err
	}
}
export function run(code: string, env: unknown) {
	return prepareRun(code)(env)
}
