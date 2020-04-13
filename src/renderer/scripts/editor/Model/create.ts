import {
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	Color,
	TextureLoader,
	NearestFilter,
	AmbientLight,
	AxesHelper,
	GridHelper,
} from 'three'
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadModels, IModelSchema } from './loadModel'
import { readJSON } from '../../Utilities/JsonFS'
import { loadAllTextures, ITextureData } from './loadTextures'
import { extname, join } from 'path'
import { createAnimation } from '../Animation/create'
import { CURRENT } from '../../constants'
import { IAnimations } from '../Animation/Format'

export interface IModelOptions {
	fov?: number
	aspect?: number
	near?: number
	far?: number
	show_helpers?: boolean
	file_path: string
}

/**
 * This function needs to become more clever about positioning the camera so the model fits the screen
 * @param camera Camera to position
 */
function positionCamera(camera: PerspectiveCamera) {
	camera.position.x = -75
	camera.position.y = 20
	camera.position.z = -100

	camera.updateProjectionMatrix()
}

/**
 * Create a new model previewer
 * @param canvas Canvas to use for rendering the model
 * @param modelConfig Configure how to render the model
 */
export async function createModelEditor(
	canvas: HTMLCanvasElement,
	{
		fov = 75,
		aspect = 2,
		near = 0.1,
		far = 1000,
		show_helpers = false,
		file_path,
	}: IModelOptions
) {
	const renderer = new WebGLRenderer({ canvas, antialias: false })
	renderer.setPixelRatio(window.devicePixelRatio)
	const camera = new PerspectiveCamera(fov, aspect, near, far)
	const controls = new OrbitControls(camera, canvas)

	const scene = new Scene()
	scene.background = new Color(
		Number(
			getComputedStyle(document.body)
				.getPropertyValue('--v-background-base')
				.replace('#', '0x')
		)
	)
	scene.add(new AmbientLight(0xffffff)) // soft white light

	if (show_helpers) {
		scene.add(new AxesHelper(50))
		scene.add(new GridHelper(20, 20))
	}

	const loader = new TextureLoader()
	const tgaLoader = new TGALoader()

	const { identifiers, materials, boneMaps } = loadModels(
		scene,
		(await readJSON(file_path).catch(() => ({}))) as IModelSchema
	)
	let allTextureData = await loadAllTextures(identifiers)
	identifiers.forEach((id, i) => {
		allTextureData[id].forEach((texData, j) => {
			if (extname(texData.texture.file_path) === '.tga')
				//@ts-ignore - Types for the tgaLoader are wrong
				texData.texture.data = tgaLoader.load(texData.texture.file_path)
			else texData.texture.data = loader.load(texData.texture.file_path)
			texData.material = materials[i]

			if (j === 0) {
				texData.material.color = undefined
				const texture = texData.texture.data
				texData.material.map = texture
				texture.magFilter = NearestFilter
				texture.minFilter = NearestFilter
			}
		})
	})
	const anim = createAnimation(
		((await readJSON(
			join(CURRENT.RP_PATH, 'animations/pesky_dragon.animation.json')
		)) as IAnimations).animations['animation.pesky_dragon.sleeping'],
		boneMaps[0]
	)

	positionCamera(camera)

	let renderingRequested = false
	const renderLoop = () => {
		controls.update()
		renderer.render(scene, camera)
		renderingRequested = false
	}
	const requestRendering = () => {
		if (!renderingRequested) {
			renderingRequested = true
			requestAnimationFrame(renderLoop)
		}
	}

	anim.play(requestRendering)

	return {
		/**
		 * Update the model preview if the window size changes
		 * @param width New window width
		 * @param height New window height
		 */
		resize(width: number, height: number) {
			renderer.setSize(width, height, true)
			camera.aspect = width / height
			camera.updateProjectionMatrix()
			requestRendering()
		},
		startRendering() {
			controls.addEventListener('change', requestRendering)
		},
		stopRendering() {
			controls.removeEventListener('change', requestRendering)
			anim.pause()

			for (let id in allTextureData) {
				allTextureData[id].forEach(({ texture: { data } }) =>
					data.dispose()
				)
			}
		},
		setBackground(color: number) {
			scene.background = new Color(color)
			requestRendering()
		},

		setTexture({ texture: { data }, material }: ITextureData) {
			material.map = data
			data.magFilter = NearestFilter
			data.minFilter = NearestFilter
			requestRendering()
		},
		get textures() {
			return allTextureData
		},
	}
}
