import { trigger } from '../../src/plugins/EventTriggers'

window.addEventListener('resize', () => {
	trigger('bridge:onResize')
})
