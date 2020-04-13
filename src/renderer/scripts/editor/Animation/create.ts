import { ISingleAnimation, TBoneModifier, TTimestamp } from './Format'
import { Group, TextBufferGeometry, MathUtils } from 'three'
import MoLang from 'molang'

export function createAnimation(
	{
		loop,
		anim_time_update,
		animation_length,
		blend_weight,
		bones,
		override_previous_animation,
	}: Partial<ISingleAnimation>,
	boneMap: Map<string, [string | undefined, Group]>
) {
	const molang = new MoLang.Interpreter({})
	let intervalID: NodeJS.Timeout
	const parseBoneModifier = (
		trans: TBoneModifier,
		currTime: number
	): [number, number, number] => {
		if (typeof trans === 'string') {
			const res = typeof trans === 'string' ? molang.parse(trans) : trans
			return [res, res, res] as [number, number, number]
		} else if (Array.isArray(trans)) {
			return trans.map(t =>
				typeof t === 'string' ? molang.parse(t) : t
			) as [number, number, number]
		} else if (trans !== undefined) {
			const timestamps = Object.entries(trans)
				.map(
					([time, trans]) =>
						[Number(time), trans] as [number, TTimestamp]
				)
				.sort(([a], [b]) => a - b)

			for (let i = timestamps.length - 1; i >= 0; i--) {
				let [time, trans] = timestamps[i]

				if (time > currTime) {
					continue
				} else if (time === currTime) {
					if (Array.isArray(trans)) {
						return trans as [number, number, number]
					} else {
						throw new Error('Format not supported yet')
					}
				} else {
					let [nextTime, nextTrans] = timestamps[
						MathUtils.euclideanModulo(i + 1, timestamps.length)
					]
					let timeDelta = nextTime - time

					if (Array.isArray(trans) && Array.isArray(nextTrans)) {
						return trans.map(
							(n, i) =>
								n +
								(((<[number, number, number]>nextTrans)[i] -
									n) /
									timeDelta) *
									(currTime - time)
						) as [number, number, number]
					} else {
						throw new Error('Format not supported yet')
					}
				}
			}
			return [0, 0, 0]
		}
	}

	for (let boneName in bones) {
		if (!boneMap.has(boneName)) continue
		const [parent, bone] = boneMap.get(boneName)
		bone.userData.defaultRotation = [
			bone.rotation.x,
			bone.rotation.y,
			bone.rotation.z,
		]
		bone.userData.defaultPosition = [
			bone.position.x,
			bone.position.y,
			bone.position.z,
		]
	}

	return {
		play(requestRendering: () => void) {
			let currTime = 0
			intervalID = setInterval(() => {
				for (let boneName in bones) {
					if (!boneMap.has(boneName)) continue
					const [parent, bone] = boneMap.get(boneName)
					const { position, rotation, scale } = bones[boneName]
					const [positionMod, rotationMod, scaleMod] = [
						position,
						rotation,
						scale,
					].map(mod => parseBoneModifier(mod, currTime))

					if (rotationMod)
						bone.rotation.set(
							...(rotationMod
								.map(MathUtils.degToRad)
								.map(
									(val, i) =>
										bone.userData.defaultRotation[i] +
										(i === 2 ? val : -val)
								) as [number, number, number])
						)

					if (positionMod)
						bone.position.set(
							...(positionMod.map(
								(val, i) =>
									bone.userData.defaultPosition[i] + val
							) as [number, number, number])
						)

					if (scaleMod) bone.scale.set(...scaleMod)
				}

				currTime += 0.05
				if (currTime > animation_length) {
					if (loop) currTime = 0
					else this.pause()
				}
				requestRendering()
			}, 50)
		},
		pause() {
			clearInterval(intervalID)
		},
	}
}
