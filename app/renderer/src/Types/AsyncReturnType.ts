export type AsyncReturnType<
	T extends (...args: unknown[]) => unknown
> = T extends (...args: unknown[]) => Promise<infer U>
	? U
	: T extends (...args: unknown[]) => infer U
	? U
	: unknown
