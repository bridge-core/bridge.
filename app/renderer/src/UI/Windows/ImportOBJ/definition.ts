import { createWindow } from '../create'
import ImportOBJComponent from './Main.vue'

export const ImportOBJ = createWindow(ImportOBJComponent, {
	identifier: 'unknown',
	scale: 1,
	OBJPath: null,
	texturePath: null,
	isFullscreen: false,
})
