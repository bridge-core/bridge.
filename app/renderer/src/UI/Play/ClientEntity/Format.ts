export interface IClientEntity {
	format_version: '1.10.0'
	'minecraft:client_entity': {
		description: {
			geometry?: IMap
			textures?: IMap
			animations?: IMap
		}
	}
}

export interface IMap {
	[name: string]: string
}
