export type TExecutionContext = 'file' | 'inline'
export function prepareRun(
	code: string,
	executionContext: TExecutionContext = 'inline'
) {
	if (code === undefined) return () => {}
	try {
		return eval(
			`(function runScript(Bridge) {
				${
					executionContext === 'inline' && !code.startsWith('return ')
						? 'return'
						: ''
				} ${code}
			})`
		)
	} catch (err) {
		throw err
	}
}
export const run = (
	code: string,
	env: unknown,
	executionContext: TExecutionContext = 'inline'
) => {
	return prepareRun(code, executionContext).call({}, env)
}

export const runFunction = (
	func: (Bridge: unknown) => unknown,
	env: unknown
) => {
	return func.call({}, env)
}
