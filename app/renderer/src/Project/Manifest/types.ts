//Minecraft manifest
export namespace MinecraftManifest {
	/**
	 * Basic Types
	 */
	export type TTypes =
		| 'data'
		| 'clientData'
		| 'resources'
		| 'interface'
		| 'worldTemplate'

	export type TVersion = [number, number, number]

	/**
	 * Interfaces for the manifest structure
	 */
	export interface IStructure {
		format_version: 1 | 2
		metadata: Partial<IMetaData>
		header: Partial<IHeader>
		capabilities: Partial<ICapabilities>
		modules: Partial<IModule>[]
		dependencies: IDependency[]
	}

	export interface IModule {
		description: string
		type: string
		uuid: string
		version: TVersion
	}
	export interface IHeader {
		name: string
		description: string
		uuid: string

		base_game_version: TVersion
		min_engine_version: TVersion
		version: TVersion

		lock_template_options: boolean
	}
	export interface IMetaData {
		authors: string[]
		license: string
		url: string
	}
	export interface ICapabilities {
		chemistry: boolean
		experimental_custom_ui: boolean
	}
	export interface IDependency {
		uuid: string
		version: TVersion
	}
}
