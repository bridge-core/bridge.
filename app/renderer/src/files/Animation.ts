import { promises as fs } from 'fs'
import path from 'path'

export default class Animation {
	format_version = '1.10.0'
	animations = {}

	async save(file_path: string) {
		if (Object.keys(this.animations).length === 0) return

		await fs.mkdir(path.dirname(file_path), { recursive: true })
		await fs.writeFile(
			file_path,
			JSON.stringify(
				{
					format_version: this.format_version,
					animations: this.animations,
				},
				null,
				'\t'
			)
		)
	}
}
