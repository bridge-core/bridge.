import { OBJtoMC } from '../OBJtoMC'

describe('FileCompiler', () => {
	test('OBJtoMC - Default', async () => {
		const {
			'minecraft:geometry': [{ description, bones }],
		} = await OBJtoMC(
			'./app/renderer/src/Compiler/File/Model/__tests__/test.obj',
			'./app/renderer/src/Compiler/File/Model/__tests__/test.png',
			'unknown',
			1
		)

		//DESCRIPTION
		expect(description.identifier).toBe('unknown')
		expect(description.texture_height).toBe(1)
		expect(description.texture_width).toBe(1)

		//BONES
		expect(bones.length).toBe(1)
		expect(bones[0].poly_mesh).toBeDefined()

		const polyMesh = bones[0].poly_mesh
		expect(polyMesh.normalized_uvs).toBe(true)
		expect(polyMesh.positions.length).toBe(4)
		expect(polyMesh.normals.length).toBe(1)
		expect(polyMesh.uvs.length).toBe(1)
		expect(polyMesh.polys.length).toBe(1)
		expect(polyMesh.polys[0].length).toBe(4)
	})
})
