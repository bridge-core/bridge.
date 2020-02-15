import { promises as fs } from 'fs'
import { DEBUG_PATH } from '../constants'
import path from 'path'
import FetchDefinitions from '../editor/FetchDefinitions'
import FILE_SYSTEM from '../FileSystem'
import LoadingWindow from '../../windows/LoadingWindow'
import InformationWindow from '../commonWindows/Information'

let CACHE: string

export async function loadDebugLog(force_reload = false) {
	if (!force_reload && CACHE) return CACHE
	let dir: string[] = []

	try {
		dir = await fs.readdir(DEBUG_PATH) //Load DEBUG directory
	} catch (e) {}

	//Only grab "ContentLog" files and get their stats
	let stats = await Promise.all(
		dir
			.filter(p => p.includes('ContentLog'))
			.map(async p => {
				//Also store absolute path so we can read the file later
				return {
					absolute_path: path.join(DEBUG_PATH, p),
					...(await fs.stat(path.join(DEBUG_PATH, p))),
				}
			})
	)

	//Find the most recently modified file
	let newest_log = stats.reduce((prev, curr) => {
		if (prev && prev.ctime > curr.ctime) return prev
		return curr
	}, undefined)

	if (newest_log !== undefined) {
		try {
			CACHE = (await fs.readFile(newest_log.absolute_path)).toString(
				'utf-8'
			)
		} catch (e) {
			CACHE = ''
		}
	} else {
		CACHE = ''
	}

	return CACHE //Return debug file content
}

export async function processedDebugLog(force_reload = false) {
	let logs = (await loadDebugLog())
		.split('\n\r')
		.map(str => str.replace(/\r|\n/g, '').substring(8, str.length))
		.filter(str => str !== '')

	let processed = []
	for (let log of logs) {
		let match = log.match(/\[.+\](\[error\]|\[warning\]|\[inform\])/g)
		let tags: string[] = []
		if (match !== null)
			tags = match
				.join(']')
				.replace(/\[/g, '')
				.split(']')

		processed.push({
			tags: tags.filter(t => t !== ''),
			error: log
				.replace(/\[.+\](\[error\]|\[warning\]|\[inform\])/g, '')
				.substr(1),
		})
	}

	return processed
}

export async function parseAffectedFiles(log: string) {
	let lw = new LoadingWindow()
	let res = (
		await Promise.all(
			log.split(' ').map(s => FetchDefinitions.broadFetch(s))
		)
	).flat()
	if (res.length > 0) res.forEach(f => FILE_SYSTEM.open(f))

	lw.close()
	if (res.length === 0)
		new InformationWindow(
			'ERROR',
			'Unable to fetch affected files from provided debug log. Make sure that you have the correct project selected.',
			false
		)
}
