/**
 * Stores data for the different voxel faces, needs to be updated once we support loading Minecraft's blocks
 */
export const VoxelFaces = [
	// Left
	{
		uvRow: 1,
		dir: [-1, 0, 0],
		corners: [
			{ pos: [0, 1, 0], uv: [0, 1] },
			{ pos: [0, 0, 0], uv: [0, 0] },
			{ pos: [0, 1, 1], uv: [1, 1] },
			{ pos: [0, 0, 1], uv: [1, 0] },
		],
	},

	// Right
	{
		uvRow: 1,
		dir: [1, 0, 0],
		corners: [
			{ pos: [1, 1, 1], uv: [0, 1] },
			{ pos: [1, 0, 1], uv: [0, 0] },
			{ pos: [1, 1, 0], uv: [1, 1] },
			{ pos: [1, 0, 0], uv: [1, 0] },
		],
	},

	// Bottom
	{
		uvRow: 2,
		dir: [0, -1, 0],
		corners: [
			{ pos: [1, 0, 1], uv: [1, 0] },
			{ pos: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, 0, 0], uv: [1, 1] },
			{ pos: [0, 0, 0], uv: [0, 1] },
		],
	},

	// Top
	{
		uvRow: 0,
		dir: [0, 1, 0],
		corners: [
			{ pos: [0, 1, 1], uv: [1, 1] },
			{ pos: [1, 1, 1], uv: [0, 1] },
			{ pos: [0, 1, 0], uv: [1, 0] },
			{ pos: [1, 1, 0], uv: [0, 0] },
		],
	},

	//Back
	{
		uvRow: 1,
		dir: [0, 0, -1],
		corners: [
			{ pos: [1, 0, 0], uv: [0, 0] },
			{ pos: [0, 0, 0], uv: [1, 0] },
			{ pos: [1, 1, 0], uv: [0, 1] },
			{ pos: [0, 1, 0], uv: [1, 1] },
		],
	},

	//Front
	{
		uvRow: 1,
		dir: [0, 0, 1],
		corners: [
			{ pos: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, 0, 1], uv: [1, 0] },
			{ pos: [0, 1, 1], uv: [0, 1] },
			{ pos: [1, 1, 1], uv: [1, 1] },
		],
	},
] as const
