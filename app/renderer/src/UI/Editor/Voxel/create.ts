import {
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	Color,
	MeshLambertMaterial,
	TextureLoader,
	NearestFilter,
	FrontSide,
	AmbientLight,
	Fog,
	Raycaster,
	Vector2,
	CanvasTexture,
} from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import { createLight } from './World/createLight'
import { createVoxelWorld, IVoxelWorldCommonOptions } from './World/create'
import { BlockLibrary, createTileMap } from './BlockLibrary/main'
import { getSelected, HotbarState } from './Inventory/Hotbar'
import TabSystem from '../../../TabSystem'
declare const __static: string

export interface IVoxelOptions extends IVoxelWorldCommonOptions {
	fov?: number
	aspect?: number
	near?: number
	far?: number
	isImmutable?: boolean
	limitedSize?: boolean
}

/**
 * Create a new voxel world editor
 * @param canvas Canvas to use to render the world
 * @param voxelRendererConfig Configure the properties of the voxel world
 */
export async function createVoxelEditor(
	canvas: HTMLCanvasElement,
	{
		fov = 75,
		aspect = 2,
		near = 0.1,
		far = 1000,
		chunkSize,
		tileSize,
		renderDistance,
		isImmutable,
		limitedSize,
	}: IVoxelOptions = {
		chunkSize: 16,
		tileSize: 16,
		renderDistance: 12,
	}
) {
	const renderer = new WebGLRenderer({ canvas, antialias: false })
	renderer.setPixelRatio(window.devicePixelRatio)
	const camera = new PerspectiveCamera(fov, aspect, near, far)
	const controls = new MapControls(camera, canvas)

	const scene = new Scene()
	// scene.fog = new Fog(
	// 	0xc9e2ff,
	// 	(renderDistance * chunkSize) / 8,
	// 	(renderDistance * chunkSize) / 3.5
	// )
	scene.background = new Color(0xc9e2ff)
	scene.add(new AmbientLight(0x404040))
	createLight({ x: -32, y: 32, z: 32, scene, color: 0xc0c0c0 })
	renderer.render(scene, camera)

	const tileMapCanvas = await createTileMap()
	const texture = new CanvasTexture(tileMapCanvas)
	texture.magFilter = NearestFilter
	texture.minFilter = NearestFilter
	const material = new MeshLambertMaterial({
		map: texture,
		side: FrontSide,
		alphaTest: 0.1,
		transparent: true,
	})

	const world = createVoxelWorld({
		chunkSize,
		renderDistance,
		tileSize,
		tileTextureWidth: tileMapCanvas.width,
		tileTextureHeight: tileMapCanvas.height,
		scene,
		material,
	})

	camera.position.y = 64
	camera.lookAt(0, 0, 0)

	let renderingRequested = false
	const renderLoop = () => {
		controls.update()
		world.updateCurrentMeshes(
			camera.position.x,
			camera.position.y,
			camera.position.z
		)
		renderer.render(scene, camera)
		renderingRequested = false
	}
	const requestRendering = () => {
		if (!renderingRequested) {
			renderingRequested = true
			requestAnimationFrame(renderLoop)
		}
	}

	const createVoxelClickListener = (placeVoxelArg: () => number) => {
		return (event: MouseEvent) => {
			const raycaster = new Raycaster()
			const mouse = new Vector2()
			const rect = canvas.getBoundingClientRect()
			mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1
			mouse.y =
				((event.clientY - rect.top) / canvas.clientHeight) * -2 + 1

			raycaster.setFromCamera(mouse, camera)

			const intersect = raycaster.intersectObjects(scene.children)[0]
			if (intersect === undefined || !intersect.face) return

			const {
				distance,
				point: { x: posX, y: posY, z: posZ },
				face: {
					normal: { x: nX, y: nY, z: nZ },
				},
			} = intersect
			// if (distance > 7) return
			const x = posX + nX * (placeVoxelArg() ? 0.5 : -0.5)
			const y = posY + nY * (placeVoxelArg() ? 0.5 : -0.5)
			const z = posZ + nZ * (placeVoxelArg() ? 0.5 : -0.5)

			world.setVoxel(x, y, z, placeVoxelArg(), !limitedSize)
			world.updateVoxelGeometry(x, y, z)
			requestRendering()
			TabSystem.setCurrentUnsaved()
		}
	}
	const onVoxelClick = createVoxelClickListener(() => getSelected())
	const onVoxelBreak = createVoxelClickListener(() => 0)

	return {
		/**
		 * Update the 3D environment if the window size changes
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
			if (!isImmutable) {
				canvas.addEventListener('click', onVoxelClick)
				canvas.addEventListener('contextmenu', onVoxelBreak)
			}
		},
		stopRendering() {
			controls.removeEventListener('change', requestRendering)
			if (!isImmutable) {
				canvas.removeEventListener('click', onVoxelClick)
				canvas.removeEventListener('contextmenu', onVoxelBreak)
			}
		},

		getWorld() {
			return world
		},
	}
}
