import { TGALoader } from 'three/examples/jsm/loaders/TGALoader'
import { promises as fs } from 'fs'

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

async function rawLoadImage(filePath: string): Promise<ImageBitmap> {
	return await createImageBitmap(new Blob([await fs.readFile(filePath)]))
}

export function loadImage(filePath: string): Promise<ImageBitmap> {
	return rawLoadImage(filePath).catch(() => {
		const l = new TGALoader()
		return new Promise((resolve, reject) => {
			l.load(filePath.replace('.png', '.tga'), texture => {
				console.log(texture.image)
				resolve(texture.image)
			})
		})
	})
}
