import { promises as fs } from 'fs'
import TGALoader from 'tga-js'

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

export function processOverlayTGA(
	imageData: ImageData,
	overlayColor?: [number, number, number]
) {
	if (!overlayColor) return imageData
	const data = imageData.data

	for (let i = 3; i < data.length; i += 4) {
		if (data[i] === 0) {
			data[i] = 255
		} else {
			data[i - 3] = (data[i - 3] * overlayColor[0]) / 255
			data[i - 2] = (data[i - 2] * overlayColor[1]) / 255
			data[i - 1] = (data[i - 1] * overlayColor[2]) / 255
		}
	}

	return imageData
}

async function loadRawImage(filePath: string): Promise<ImageBitmap> {
	return await createImageBitmap(new Blob([await fs.readFile(filePath)]))
}
async function loadRawTGA(
	filePath: string,
	overlayColor?: [number, number, number]
): Promise<ImageBitmap> {
	const tga = new TGALoader()
	const fileBuffer = await fs.readFile(filePath)
	tga.load(new Uint8Array(fileBuffer))
	return await createImageBitmap(
		processOverlayTGA(tga.getImageData(), overlayColor)
	)
}

export function loadImage(
	filePath: string,
	overlayColor?: [number, number, number]
): Promise<ImageBitmap> {
	return loadRawImage(filePath + '.png').catch(() =>
		loadRawTGA(filePath + '.tga', overlayColor)
	)
}
