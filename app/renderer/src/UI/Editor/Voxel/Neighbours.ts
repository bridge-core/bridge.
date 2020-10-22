/**
 * Array to store all neighbours of a voxel, useful for iterating
 */
export const VoxelNeighbours = [
	[0, 0, 0], // Self
	[-1, 0, 0], // Left
	[1, 0, 0], // Right
	[0, -1, 0], // Down
	[0, 1, 0], // Up
	[0, 0, -1], // Back
	[0, 0, 1], // Front
]
