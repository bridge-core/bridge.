import FetchDefinitions from '../FetchDefinitions'
import { readJSON } from '../../Utilities/JsonFS'
import { Texture, MeshLambertMaterial } from 'three'
import { CURRENT } from '../../constants'
import { join } from 'path'
import { promises as fs, existsSync } from "fs"
declare const __static: string;

export interface ITextureData {
	texture: {
		name: string
		file_path: string
		data?: Texture
	}
	material?: MeshLambertMaterial
}

export async function loadAllTextures(identifiers: string[]) {
	let res: { [id: string]: ITextureData[] } = {}
	await Promise.all(
		identifiers.map(async id => {
			res[id] = await loadTextures(id)
			console.log(await guessTexture(id))
			if(res[id].length === 0) res[id] = await guessTexture(id)
		})
	)

	return res
}


const GUESS_DATA = () => [[CURRENT.RP_PATH, '.png'], [join(__static, "vanilla/RP"), '.png']]
async function guessTexture(identifier: string) {
	return (await Promise.all(GUESS_DATA().map(async ([base, ext]) => {
		let try_folder = join(base, 'textures/entity', identifier.split(":").pop().split(".")[1])
		try {
				let entries = await fs.readdir(try_folder)
				return entries.map(en => ({ texture: { file_path: join(try_folder, en + ext), name: 'Unknown' } }))
		} catch(e) {
			console.log(try_folder + ext, e)
			return {
				texture: {
					name: 'Unknown',
					file_path: try_folder + ext
				}
			}
		}
	}))).flat().filter(entry => entry !== undefined && existsSync(entry.texture.file_path))
}

export async function loadTextures(identifier: string) {
	//Get all files that use the model
	let files = await FetchDefinitions.fetchSingle(
		'client_entity',
		['geometry_identifiers'],
		identifier,
		true
	)

	//Load textures from the files
	let textures = await Promise.all(
		files.map(async f => {
			return (await readJSON(f).catch(() => ({})))[
				'minecraft:client_entity'
			]?.description?.textures as { [name: string]: string }
		})
	)

	//Change data format
	let data: ITextureData[] = []
	textures.forEach(texObj => {
		for (let [key, val] of Object.entries(texObj ?? {}))
			data.push({
				texture: {
					name: key,
					file_path: join(CURRENT.RP_PATH, val.endsWith('.png') ? val : val + '.png'),
				},
			})
	})

	return data.reduce(
		(unique: ITextureData[], curr) =>
			unique.find(
				({ texture: { file_path } }) =>
					file_path === curr.texture.file_path
			)
				? unique
				: unique.concat([curr]),
		[]
	)
}
