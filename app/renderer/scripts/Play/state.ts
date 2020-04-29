import Vue from 'vue'

export type TPlayerType = 'entity' | 'client_entity' | 'particle' | 'model'
export interface IPlayState {
	isVisible: boolean
	player: TPlayerType
}

export const CanvasPlayers = ['client_entity', 'particle', 'model']

export const PlayState: IPlayState = Vue.observable({
	isVisible: false,
	player: 'entity',
	loader: 'entity',
})
