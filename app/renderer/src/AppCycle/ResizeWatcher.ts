import { trigger } from './EventSystem'
import { on } from './EventSystem'
import debounce from 'lodash.debounce'
declare function requestIdleCallback(cb: () => void): void

window.addEventListener(
	'resize',
	debounce(() => trigger('bridge:onResize'), 100)
)
on('bridge:onSidebarVisibilityChange', () =>
	requestIdleCallback(() => trigger('bridge:onResize'))
)
