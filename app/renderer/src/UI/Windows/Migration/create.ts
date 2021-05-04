import LoadingWindow from '../../../../windows/LoadingWindow'

export function createV2Directory(path: string, projects: string[]) {
	const lw = new LoadingWindow()
	console.log(path)
	console.log(projects)
	/* TODO
	 *	-  Copy projects to v2 folder structure
	 */
	lw.close()
}
