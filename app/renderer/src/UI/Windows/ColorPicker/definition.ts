import { createWindow } from '../create'
import ColorPickerComponent from './Main.vue'

export function createColorPickerWindow(
	colorValue: string,
	editColor: (color: string) => void
) {
	const ColorPicker = createWindow(ColorPickerComponent, {
		color: colorValue,
		editColorCb: editColor,
	})
	ColorPicker.open()
	return ColorPicker
}
