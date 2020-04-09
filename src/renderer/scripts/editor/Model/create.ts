import {
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	Color,
	MeshLambertMaterial,
	TextureLoader,
	NearestFilter,
	AmbientLight,
	DoubleSide,
	AxesHelper,
	GridHelper,
	Texture,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { join } from 'path'
import { loadModels, IModelSchema } from './loadModel'
import { readJSON } from '../../Utilities/JsonFS'
import { loadTextures } from './loadTextures'
import { CURRENT } from '../../constants'
declare var __static: string

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
	scene.background = new Color(0xc9e2ff)
	scene.add(new AmbientLight(/*0xa0a0a0*/ 0xd0d0d0)) // soft white light

	if (show_helpers) {
		scene.add(new AxesHelper(100))
		scene.add(new GridHelper(20, 20))
	}

	const loader = new TextureLoader()
	const material = new MeshLambertMaterial({
		color: '#FF00FF',
		side: DoubleSide,
		alphaTest: 0.1,
		transparent: true,
	})
	const { identifiers } = loadModels(
		scene,
		material,
		(await readJSON(file_path)) as IModelSchema
	)
	let textures = await loadTextures(identifiers)
	textures.forEach(
		data =>
			(data.texture = loader.load(join(CURRENT.RP_PATH, data.file_path)))
	)
	if (textures.length > 0) {
		material.color = undefined
		const texture = textures[0].texture
		material.map = texture
		texture.magFilter = NearestFilter
		texture.minFilter = NearestFilter
	}

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

	return {
		/**
		 * Update the model preview if the window size changes
		 * @param width New window width
		 * @param height New window height
		 */
		resize(width: number, height: number) {
			renderer.setSize(width, height, false)
			camera.aspect = width / height
			camera.updateProjectionMatrix()
			requestRendering()
		},
		startRendering() {
			controls.addEventListener('change', requestRendering)
		},
		stopRendering() {
			controls.removeEventListener('change', requestRendering)
		},

		setTexture(tex: Texture) {
			material.map = tex
			tex.magFilter = NearestFilter
			tex.minFilter = NearestFilter
			requestRendering()
		},
		get textures() {
			return textures
		},
	}
}
