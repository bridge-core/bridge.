export type TExecutionContext = 'file' | 'inline'
export interface IRunConfig {
	executionContext?: TExecutionContext
	envName?: string
	async?: boolean
}
export function prepareRun(
	code: string,
	{
		executionContext = 'inline',
		envName = 'Bridge',
		async = false,
	}: IRunConfig
): (...args: unknown[]) => Promise<unknown> | unknown | void {
	if (code === undefined) return () => {}
	try {
		return eval(
			`(${async ? 'async ' : ''}function runScript(${envName}) {
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
	{
		executionContext = 'inline',
		envName = 'Bridge',
		async = false,
	}: IRunConfig = {}
): Promise<unknown> | unknown => {
	return Array.isArray(env)
		? prepareRun(code, { executionContext, envName, async }).call(
				{},
				...env
		  )
		: prepareRun(code, { executionContext, envName, async }).call({}, env)
}

export const runFunction = (
	func: (Bridge: unknown) => unknown,
	env: unknown
) => {
	return func.call({}, env)
}
