import { promises as fs } from 'fs'
import { join } from 'path'
import { readJSON, writeJSON } from '../../../Utilities/JsonFS'
import { transform } from './tranformCache'

export async function transferProject(
	src: string,
	dest: string,
	cache: string,
	deleteSrc: boolean = false
) {
	// Create target directory
	await fs.mkdir(dest, { recursive: true })

	const dirents = await fs.readdir(src, { withFileTypes: true })

	for (const dirent of dirents) {
		if (dirent.isDirectory()) {
			// Don't copy bridge folder
			if (!(dirent.name === 'bridge' && !deleteSrc))
				await transferProject(
					join(src, dirent.name),
					join(dest, dirent.name),
					cache ? join(cache, dirent.name) : null,
					deleteSrc
				)
			if (deleteSrc) await fs.rmdir(join(src, dirent.name))
			continue
		}

		try {
			if (!cache) throw {}

			// Try reading from cache
			const { cache_content: cacheContent } = await readJSON(
				join(cache, dirent.name)
			)

			// Non JSON files: Functions, scripts etc.
			if (!dirent.name.endsWith('.json')) {
				await fs.writeFile(join(dest, dirent.name), cacheContent)
			} else {
				// JSON files
				const transformedCache = transform(cacheContent.children)
				console.log(!transformedCache)
				if (!transformedCache) throw {}
				await writeJSON(join(dest, dirent.name), transformedCache, true)
			}
		} catch {
			// No cache, just copy file
			try {
				await fs.copyFile(
					join(src, dirent.name),
					join(dest, dirent.name)
				)

				if (deleteSrc) await fs.unlink(join(src, dirent.name))
			} catch {
				console.log(`[MIGRATION] Error copying file: ${dirent.name}')}`)
			}
		}
	}
}
