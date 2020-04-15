import Vue from 'vue'

export interface IPlayState {
	isVisible: boolean
	player: 'entity' | 'client_entity' | 'particle' | 'model'
}

export const CanvasPlayers = ['client_entity', 'particle', 'model']

export const PlayState: IPlayState = Vue.observable({
	isVisible: false,
	player: 'entity',
	loader: 'entity',
})
