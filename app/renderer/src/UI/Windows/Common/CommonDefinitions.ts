import { createWindow } from '../create'
import InformationComponent from './Information/Information.vue'
import InputComponent from './Input/Input.vue'
import DropdownComponent from './Dropdown/Dropdown.vue'

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
		onConfirmCb: onConfirm,
	})
	Input.open()
	return Input
}

export function createDropdownWindow(
	displayName: String,
	placeholderText: String,
	options: Array<string>,
	onConfirm: (input: string) => void
) {
	const Dropdown = createWindow(DropdownComponent, {
		windowTitle: displayName,
		placeholder: placeholderText,
		selectedValue: '',
		items: options,
		onConfirmCb: onConfirm,
	})
	Dropdown.open()
	return Dropdown
}
