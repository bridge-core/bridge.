import { basename, dirname } from 'path'

export function getFolderDiff(path_1: string, path_2: string) {
	while (
		basename(path_1) === basename(path_2) &&
		dirname(path_1) !== '.' &&
		dirname(path_2) !== '.'
	) {
		path_1 = dirname(path_1)
		path_2 = dirname(path_2)
	}

	return [basename(path_1), basename(path_2)] as const
}
