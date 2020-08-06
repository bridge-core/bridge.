import { createWindow } from '../create'
import InformationComponent from './Information.vue'
import InputComponent from './Input.vue'

export function createInformationWindow(
	displayName: String,
	displayContent: String
) {
	const Information = createWindow(InformationComponent, {
		windowTitle: displayName,
		content: displayContent,
	})
	Information.open()
}

export function createInputWindow(
	displayName: String,
	inputLabel: String,
	onConfirm: (input: string) => void
) {
	const Input = createWindow(InputComponent, {
		windowTitle: displayName,
		label: inputLabel,
		inputValue: '',
	})
	Input.open()
	return {
		...Input,
		confirm: () => {
			Input.close()
			console.log('testing')
			onConfirm(inputValue)
		},
	}
}
