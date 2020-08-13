import { createWindow } from '../create'
import CloseUnsavedTabComponent from './Main.vue'

export function createCloseUnsavedTabWindow(
	onConfirm: () => void,
	onClose: () => void,
	onCancel: () => void
) {
	const CloseUnsavedTab = createWindow(CloseUnsavedTabComponent, {
		onConfirmCb: onConfirm,
		onCancelCb: onCancel,
		onCloseCb: onClose,
	})
	CloseUnsavedTab.open()
	return CloseUnsavedTab
}
