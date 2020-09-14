export function isTransparentTexture(
	context: CanvasRenderingContext2D,
	sx: number,
	sy: number
) {
	const data = context.getImageData(sx, sy, 16, 16).data

	for (let i = 3; i < data.length; i += 4) {
		if (data[i] < 255) return true
	}
	return false
}
