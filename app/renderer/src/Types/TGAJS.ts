declare module 'tga-js' {
	export default class TGALoader {
		load(uint8arr: Uint8Array): void
		open(filePath: string, onLoad: () => void): void
		getDataURL(mimeType: 'image/png'): string
		getImageData(imageData?: ImageData): ImageData
	}
}
