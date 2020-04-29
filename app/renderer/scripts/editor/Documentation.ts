/**
 * Documentation tooling
 * Opens bedrock.dev or a dedicated window if custom documentation is available
 */
declare var __static: string

import { shell } from 'electron'
import path from 'path'
import { readJSON } from '../Utilities/JsonFS'
import ContentWindow from '../commonWindows/Content'
import FileType from './FileType'
import { DOC_URL } from '../constants'

export async function openDocumentation(query: string, file_path: string) {
	let doc = FileType.getDocumentation(file_path) || 'Addons'

	if (typeof doc === 'string') {
		shell.openExternal(`${DOC_URL}${encodeURI(doc)}#${encodeURI(query)}`)
	} else {
		if (doc.inject) {
			let inject = await readJSON(
				path.join(__static, `documentation/${doc.inject}.json`)
			)
			console.log(inject, query)
			if (inject[query] !== undefined) {
				return new ContentWindow(
					{
						display_name: 'Documentation',
						options: {},
						content: [
							{
								text: '\n',
							},
							{
								type: 'big-header',
								text: inject[query].title || query,
							},
							{
								type: 'divider',
							},
							{
								text: `\n${inject[query].description}`,
							},
						],
					},
					'documentation.'
				)
			}
		}
		shell.openExternal(
			`${DOC_URL}${encodeURI(doc.base)}#${doc.extend || query}`
		)
	}
}
