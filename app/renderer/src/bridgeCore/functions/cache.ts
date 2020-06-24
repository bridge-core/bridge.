export const FunctionCache = new Map<string, Set<string>>()
export const CacheTests: [string, RegExp][] = [
	['scoreboards', /(scoreboard\s+objectives\s+add\s+)(.+)(\s+dummy)/],
	['tags', /(tag\s+.+\s+add\s+)(.+)/],
	['tags', /(tag\s+.+\s+remove\s+)(.+)/],
]
export async function setFunctionCache(
	line: string,
	tests: [string, RegExp][]
) {
	for (const [id, test] of tests) {
		const result = line.match(test)
		if (result !== null) {
			if (FunctionCache.has(id)) {
				FunctionCache.get(id).add(result[2])
			} else {
				FunctionCache.set(id, new Set(result[2]))
			}
		}
	}
}
