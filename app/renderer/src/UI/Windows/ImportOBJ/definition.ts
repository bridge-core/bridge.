import { createWindow } from '../create'
import ImportOBJComponent from './Main.vue'

export const ImportOBJ = createWindow(ImportOBJComponent, {
	identifier: 'unknown',
	scale: 1,
	OBJPath: null,
	TexturePath: null,
	isFullscreen: false,
})
