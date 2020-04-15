import { createAppMenu } from './create'
import { DevMenu } from './Category/dev'
import { FileMenu } from './Category/file'
import { HelpMenu } from './Category/help'
import { ToolMenu } from './Category/tools'
import { EditMenu } from './Category/edit'
import { setupKeyBindings } from '../editor/KeyBindings/main'

let CATEGORIES = [FileMenu, EditMenu, ToolMenu, HelpMenu]

export function setupDefaultMenus() {
	setupKeyBindings()
	CATEGORIES.forEach(c => createAppMenu(c))

	if (process.env.NODE_ENV === 'development') {
		createAppMenu(DevMenu)
	}
}
