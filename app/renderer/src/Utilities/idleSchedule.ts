import { IDisposable } from '../Types/disposable'

declare const requestIdleCallback: (func: () => void) => number
declare const cancelIdleCallback: (id: number) => void
type TExecutor<T> = (
	resolve: (value?: T) => void,
	reject: (reason?: any) => void
) => void

export class IdlePromise<T> implements IDisposable {
	private callbackId: number
	private promise: Promise<T>
	constructor(callback: () => void) {
		const executor: TExecutor<T> = function(resolve, reject) {
			this.callbackId = requestIdleCallback(async () => {
				await callback()
				resolve()
			})
		}

		this.promise = new Promise(executor)
	}

	dispose() {
		cancelIdleCallback(this.callbackId)
	}

	then = this.promise.then
	catch = this.promise.catch
	finally = this.promise.finally
}

export function idleSchedule<T>(callback: () => void) {
	return new IdlePromise<T>(callback)
}
