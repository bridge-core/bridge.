import { Scene, DirectionalLight } from 'three'

export interface ILightConfig {
	x: number
	y: number
	z: number

	scene: Scene

	color?: number
	intensity?: number
}

export function createLight({
	x,
	y,
	z,
	scene,
	color = 0xffffff,
	intensity = 1,
}: ILightConfig) {
	const light = new DirectionalLight(color, intensity)
	light.position.set(x, y, z)
	scene.add(light)
}
