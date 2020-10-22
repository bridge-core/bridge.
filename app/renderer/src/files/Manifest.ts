/**
 * Create manifest objects used for BPs & RPs
 */
import uuidv4 from 'uuid/v4'
import ProjectConfig from '../Project/Config'
import path from 'path'

interface Module {
	type: string
	uuid: string
	version: [number, number, number]
}
interface Header {
	name: string
	description: string
	uuid: string
	version: [number, number, number]
	min_engine_version?: [number, number, number]
}
interface Dependency {
	version: [number, number, number]
	uuid: string
}

export default class Manifest {
	format_version = 2
	header: Header
	modules: Module[]
	dependencies: Dependency[]

	constructor(
		type: 'resources' | 'data',
		client_data?: boolean,
		dependency?: Dependency,
		targetProjectVersion?: string
	) {
		if (type === 'resources') {
			this.header = {
				name: 'pack.name',
				description: 'pack.description',
				uuid: uuidv4(),
				version: [1, 0, 0],
				min_engine_version: [1, 13, 0],
			}
		} else {
			this.header = {
				name: 'pack.name',
				description: 'pack.description',
				uuid: uuidv4(),
				version: [1, 0, 0],
				min_engine_version: [1, 13, 0],

				/**
				 * Yay, Minecraft doesn't like our new feature... -.-
				 * Disabled it until it works
				 */
				// min_engine_version: <[number, number, number]>(
				// 	targetProjectVersion.split('.').map(n => Number(n))
				// ),
			}
		}
		this.modules = [
			{
				type,
				uuid: uuidv4(),
				version: [1, 0, 0],
			},
		]

		if (client_data) this.addClientData()

		if (dependency !== undefined) {
			this.dependencies = [dependency]
		}
	}

	addClientData() {
		Manifest.addClientData(this)
	}
	removeClientData() {
		Manifest.removeClientData(this)
	}
	static removeClientData(manifest: Manifest) {
		manifest.modules = manifest.modules.filter(
			({ type }) => type !== 'client_data'
		)
	}
	static addClientData(manifest: Manifest) {
		manifest.modules.push({
			type: 'client_data',
			uuid: uuidv4(),
			version: [1, 0, 0],
		})
	}
	static hasClientData(manifest: Manifest) {
		for (let { type } of manifest.modules) {
			if (type === 'client_data') return true
		}
		return false
	}

	static getPackFolder(file_path: string) {
		let folders = path.dirname(file_path).split(path.sep)
		return folders[folders.length - 2]
	}

	get uuid() {
		return this.header.uuid
	}

	get() {
		return JSON.stringify(this, null, '\t')
	}
}
