import {
	Scene,
	WebGLRenderer,
	PerspectiveCamera,
	AmbientLight,
	AxesHelper,
	GridHelper,
	Color,
	TextureLoader,
	NearestFilter,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export interface IRenderOptions {
	fov?: number
	aspect?: number
	near?: number
	far?: number
	showHelpers?: boolean
}

export function createRenderer(
	canvas: HTMLCanvasElement,
	{ fov, aspect, near, far, showHelpers }: IRenderOptions
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

	if (showHelpers) {
		scene.add(new AxesHelper(50))
		scene.add(new GridHelper(20, 20))
	}

	const loader = new TextureLoader()

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
		},
		setBackground(color: number) {
			scene.background = new Color(color)
			requestRendering()
		},
	}
}
