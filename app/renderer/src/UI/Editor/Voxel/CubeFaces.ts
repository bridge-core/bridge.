/**
 * Store data to create a Minecraft model cube
 */
export const CubeFaces = [
	// Left
	{
		/**
		 * Position of the texture for this specific cube
		 *
		 * baseUV[0] <-> X | baseUV[1] <-> Y
		 *
		 * How baseUV maps to a Minecraft cube texture:
		 * @example
		 *   | X | 0 | 1 | 2 | 3 |
		 * -----------------------
		 * Y |   |   |   |   |   |
		 * -----------------------
		 * 0 |   |   |xxx|xxx|   |
		 * -----------------------
		 * 1 |   |xxx|xxx|xxx|xxx|
		 */
		baseUV: [0, 1],
		dir: [-1, 0, 0],
		corners: [
			{ pos: [0, 1, 0], uv: [1, 1] },
			{ pos: [0, 0, 0], uv: [1, 0] },
			{ pos: [0, 1, 1], uv: [0, 1] },
			{ pos: [0, 0, 1], uv: [0, 0] },
		],
	},

	// Right
	{
		baseUV: [2, 1],
		dir: [1, 0, 0],
		corners: [
			{ pos: [1, 1, 1], uv: [1, 1] },
			{ pos: [1, 0, 1], uv: [1, 0] },
			{ pos: [1, 1, 0], uv: [0, 1] },
			{ pos: [1, 0, 0], uv: [0, 0] },
		],
	},

	// Bottom
	{
		baseUV: [2, 0],
		dir: [0, -1, 0],
		corners: [
			{ pos: [1, 0, 1], uv: [1, 1] },
			{ pos: [0, 0, 1], uv: [0, 1] },
			{ pos: [1, 0, 0], uv: [1, 0] },
			{ pos: [0, 0, 0], uv: [0, 0] },
		],
	},

	// Top
	{
		baseUV: [1, 0],
		dir: [0, 1, 0],
		corners: [
			{ pos: [0, 1, 1], uv: [0, 1] },
			{ pos: [1, 1, 1], uv: [1, 1] },
			{ pos: [0, 1, 0], uv: [0, 0] },
			{ pos: [1, 1, 0], uv: [1, 0] },
		],
	},

	//Front
	{
		baseUV: [1, 1],
		dir: [0, 0, -1],
		corners: [
			{ pos: [1, 0, 0], uv: [1, 0] },
			{ pos: [0, 0, 0], uv: [0, 0] },
			{ pos: [1, 1, 0], uv: [1, 1] },
			{ pos: [0, 1, 0], uv: [0, 1] },
		],
	},

	//Back
	{
		baseUV: [3, 1],
		dir: [0, 0, 1],
		corners: [
			{ pos: [0, 0, 1], uv: [1, 0] },
			{ pos: [1, 0, 1], uv: [0, 0] },
			{ pos: [0, 1, 1], uv: [1, 1] },
			{ pos: [1, 1, 1], uv: [0, 1] },
		],
	},
] as const
