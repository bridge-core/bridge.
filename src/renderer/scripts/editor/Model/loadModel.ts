import {
	Scene,
	Material,
	Group,
	MathUtils,
	Vector3,
	MeshLambertMaterial,
	DoubleSide,
} from 'three'
import { createCube } from './createCube'
import InformationWindow from '../../commonWindows/Information'
import { lessThan } from '../../Utilities/VersionUtils'

export interface IImageProps {
	width: number
	height: number
}

export interface IOldModelSchema {
	format_version?: '1.8.0' | '1.10.0'

	[id: string]:
		| {
				texturewidth?: number
				textureheight?: number
				bones?: IBoneSchema[]
		  }
		| string
}

export interface IModelSchema {
	format_version?: '1.12.0'
	'minecraft:geometry'?: IGeoSchema[]
}

export interface IGeoDescriptionSchema {
	identifier?: string
	texture_width?: number
	texture_height?: number
}

export interface IGeoSchema {
	description?: IGeoDescriptionSchema
	bones?: IBoneSchema[]
}

export interface IBoneSchema {
	name?: string
	parent?: string
	pivot?: [number, number, number]
	rotation?: [number, number, number]
	mirror?: boolean
	cubes?: ICubeSchema[]
}

export interface ICubeSchema {
	origin?: [number, number, number]
	size?: [number, number, number]
	uv?: [number, number] | IUVObj
	rotation?: [number, number, number]
	pivot?: [number, number, number]
	mirror?: boolean
}
export interface IUVObj {
	north: IUVConfig
	south: IUVConfig
	east: IUVConfig
	west: IUVConfig
	up: IUVConfig
	down: IUVConfig
}
export interface IUVConfig {
	uv: [number, number]
	uv_size: [number, number]
}

/**
 * Load all models of the provided models data
 * @param scene Scene to add the model to
 * @param material Material to use for the 3D objects
 * @param models Data to load models from
 */
export function loadModels(
	scene: Scene,
	models: IModelSchema | IOldModelSchema
): {
	models: Group[]
	boneMaps: Map<string, [string | undefined, Group]>[]
	identifiers: string[]
	materials: MeshLambertMaterial[]
} {
	if (lessThan(models.format_version ?? '1.2.0', '1.12.0')) {
		let convertedModels: IGeoSchema[] = []
		for (let [identifier, data] of Object.entries(models)) {
			if (typeof data === 'string') continue
			const { bones, texturewidth, textureheight } = data

			convertedModels.push({
				description: {
					identifier,
					texture_width: texturewidth,
					texture_height: textureheight,
				},
				bones,
			})
		}

		return loadModels(scene, {
			format_version: '1.12.0',
			'minecraft:geometry': convertedModels,
		})
	} else if (models['minecraft:geometry'] === undefined) {
		new InformationWindow(
			'ERROR',
			'Oops, bridge. currently cannot open this model!'
		)
		return { models: [], identifiers: [], materials: [], boneMaps: [] }
	}

	let allModels: Group[] = []
	let identifiers: string[] = []
	let materials: MeshLambertMaterial[] = []
	let boneMaps = []

	for (let modelData of (models as IModelSchema)['minecraft:geometry'] ??
		[]) {
		const material = new MeshLambertMaterial({
			color: '#FF00FF',
			side: DoubleSide,
			alphaTest: 0.2,
			transparent: true,
		})
		let { model, boneMap } = loadModel(material, modelData)

		identifiers.push(modelData.description.identifier)
		materials.push(material)
		boneMaps.push(boneMap)

		model.position.add(new Vector3(100 * allModels.length, 0, 0))
		scene.add(model)
		allModels.push(model)
	}

	return {
		models: allModels,
		boneMaps,
		identifiers,
		materials,
	}
}

/**
 * Load a single model
 * @param material Material to use for the 3D objects
 * @param geometryData Geometry data & description of the model
 */
export function loadModel(
	material: Material,
	{
		bones = [],
		description: {
			identifier = '',
			texture_width = 64,
			texture_height = 64,
		} = {},
	}: IGeoSchema
) {
	let model = new Group()
	model.name = identifier
	let boneMap = new Map<string, [string | undefined, Group]>()

	for (let { name, parent, cubes = [], pivot, rotation, mirror } of bones) {
		let currBone = new Group()
		currBone.name = name ?? ''

		for (let i = 0; i < cubes.length; i++) {
			const {
				origin = [0, 0, 0] as [number, number, number],
				size = [1, 1, 1] as [number, number, number],
				uv = [0, 0] as [number, number],
				rotation: cRotation,
				pivot: cPivot,
				mirror: cMirror,
			} = cubes[i]

			currBone.add(
				createCube(
					size[0],
					size[1],
					size[2],
					uv,
					[texture_width, texture_height],
					cMirror === undefined && cRotation === undefined //Only cubes without rotation inherit mirror arg from bone
						? mirror ?? false
						: cMirror ?? false
				).createMesh(material, origin, cPivot ?? pivot, cRotation)
			)
		}

		const pivotGroup = new Group()
		pivotGroup.rotation.order = 'ZYX'
		if (pivot) {
			const [pX, pY, pZ] = pivot
			pivotGroup.position.set(-pX, pY, pZ)
			currBone.position.set(pX, -pY, -pZ)
			pivotGroup.add(currBone)
			pivotGroup.name = `#pivot.${name}`
		} else {
			pivotGroup.position.set(0, 0, 0)
		}

		if (rotation) {
			const [rX, rY, rZ] = rotation

			pivotGroup.rotation.set(
				MathUtils.degToRad(-rX),
				MathUtils.degToRad(-rY),
				MathUtils.degToRad(rZ)
			)
		}

		if (!parent) model.add(pivotGroup)
		if (name) boneMap.set(name, [parent, pivotGroup])
	}

	//Set bone parents
	for (let [boneName, [parent, bone]] of boneMap)
		if (parent) {
			const parentGroup = boneMap.get(parent)?.[1]
			if (parentGroup && parentGroup.name.startsWith('#pivot.'))
				parentGroup.children[0].add(bone)
			else if (parentGroup) parentGroup.add(bone)
		}

	return {
		model,
		boneMap,
	}
}
