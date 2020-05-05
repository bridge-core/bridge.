import { createAppMenu } from './create'
import { DevMenu } from './Category/dev'
import { FileMenu } from './Category/file'
import { HelpMenu } from './Category/help'
import { ToolMenu } from './Category/tools'
import { EditMenu } from './Category/edit'
import { setupKeyBindings } from '../../editor/KeyBindings/main'
import Store from '../../../store/index'
import { IDisposable } from '../../Types/disposable'

let CATEGORIES = [FileMenu, EditMenu, ToolMenu, HelpMenu]
let DISPOSABLES: IDisposable[] = []
export const DEV_MENU = createAppMenu(DevMenu, false)

export function setupDefaultMenus() {
	DISPOSABLES.forEach(dis => dis.dispose())
	setupKeyBindings()
	DISPOSABLES = CATEGORIES.map(c => createAppMenu(c))

	if (Store.state.Settings.is_dev_mode) {
		DEV_MENU.add()
	}
}
