import { createWindow } from '../create'
import CloseUnsavedTabComponent from './Main.vue'

export function createCloseUnsavedTabWindow(
	onConfirm: () => void,
	onCancel: () => void,
	onClose: () => void
) {
	const CloseUnsavedTab = createWindow(CloseUnsavedTabComponent, {
		onConfirmCb: onConfirm,
		onCancelCb: onCancel,
		onCloseCb: onClose,
	})
	CloseUnsavedTab.open()
	return CloseUnsavedTab
}
