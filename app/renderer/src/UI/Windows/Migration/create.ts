import { PathLike, promises as fs } from 'fs'
import { join } from 'path'
import { BP_BASE_PATH, RP_BASE_PATH } from '../../../../../shared/Paths'
import { readJSON, writeJSON } from '../../../Utilities/JsonFS'

async function iterateDir(src: string, dest: string, cache: string) {
	await fs.mkdir(dest, { recursive: true })

	const dirents = await fs.readdir(src, { withFileTypes: true })

	for (const dirent of dirents) {
		if (dirent.isDirectory()) {
			// Don't copy bridge folder
			if (dirent.name != 'bridge') {
				iterateDir(
					join(src, dirent.name),
					join(dest, dirent.name),
					join(cache, dirent.name)
				)
			}
			continue
		}

		try {
			// Try reading from cache
			const { cache_content: cacheContent } = await readJSON(
				join(cache, dirent.name)
			)

			await writeJSON(
				join(dest, dirent.name),
				transform(cacheContent.children),
				true
			)
		} catch {
			// No cache, just copy file
			await fs.copyFile(join(src, dirent.name), join(dest, dirent.name))
		}
	}
}

function transform(children: any[]) {
	// TODO Fix transforming objects nested in arrays
	const res: any = {}

	for (const c of children) {
		if (c.is_disabled) continue
		if (c.is_minified) res[c.key] = c.data || c.children || c.array
		else if (Array.isArray(c.children)) {
			if (c.key === undefined) res.push(transform(c.children))
			res[c.key] = transform(c.children)
		} else if (c.key && c.data) {
			if (c.key == 'format_version') res[c.key] = c.data
			else res[c.key] = convertValues(c.data)
		}
	}
	return res
}

function convertValues(value: string) {
	if (value == 'false') return false
	else if (value == 'true') return true
	else {
		const newValue = parseInt(value)
		if (isNaN(newValue)) return value
		else return newValue
	}
}

export async function createV2Directory(
	targetPath: string,
	projects: string[]
) {
	const projectPath = join(targetPath, 'projects')

	for (const bpPath of projects) {
		// Find linked RP
		let rpPath = undefined
		let bpManifest = undefined
		let rpManifest = undefined

		try {
			bpManifest = await readJSON(
				join(BP_BASE_PATH, bpPath, 'manifest.json')
			)
		} catch {}

		if (bpManifest) {
			// Check RPs
			const resourcePacks = await fs.readdir(RP_BASE_PATH)
			for (const rp of resourcePacks) {
				try {
					rpManifest = await readJSON(
						join(RP_BASE_PATH, rp, 'manifest.json')
					)
				} catch {}

				if (bpManifest.dependencies && rpManifest) {
					for (const dependency of bpManifest.dependencies) {
						if (dependency.uuid == rpManifest.header.uuid) {
							rpPath = rp
						}
					}
				}
			}
		}

		// Copy files over
		await iterateDir(
			join(BP_BASE_PATH, bpPath),
			join(targetPath, 'projects', bpPath, 'BP'),
			join(BP_BASE_PATH, bpPath, 'bridge/cache/BP')
		)

		if (rpPath) {
			await iterateDir(
				join(RP_BASE_PATH, rpPath),
				join(targetPath, 'projects', bpPath, 'RP'),
				join(BP_BASE_PATH, bpPath, 'bridge/cache/RP')
			)
		}
	}
}
