import { promises as fs } from 'fs'
import { join } from 'path'
import { ICompilerConfig } from './config'

export abstract class Compiler {
	abstract CompileFolders: Set<string>

	async compile(
		originDir: string,
		locationDir: string,
		config: ICompilerConfig
	) {
		for (let folder of this.CompileFolders)
			await this.loadDir(
				join(originDir, folder),
				join(locationDir, folder),
				config
			)
	}

	async compileFile(filePath: string, config: ICompilerConfig) {}

	async loadDir(path: string, locationDir: string, config: ICompilerConfig) {
		let dirents = await fs.readdir(path, { withFileTypes: true })
		await Promise.all(
			dirents.map(async dirent => {
				if (dirent.isFile())
					await this.compileFile(join(path, dirent.name), config)
				else
					await this.loadDir(
						join(path, dirent.name),
						join(locationDir, dirent.name),
						config
					)
			})
		)
	}
}

export class BPCompiler extends Compiler {
	CompileFolders = new Set<string>([
		'entities',
		'functions',
		'items',
		'blocks',
	])
}

export class RPCompiler extends Compiler {
	CompileFolders = new Set<string>([
		'entity',
		'models',
		'items',
		'sounds',
		'texts',
		'sounds',
	])
}
