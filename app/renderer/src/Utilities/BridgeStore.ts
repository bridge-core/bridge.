import fs from 'fs'
import mkdirp from 'mkdirp'
import { sep, join } from 'path'

export default class BridgeStore {
	namespace: string
	path: string

	constructor(path: string, namespace: string) {
		this.namespace = namespace + sep
		this.path = path
	}

	setup(namespace: string) {
		if (namespace === undefined)
			throw new Error('You need to define a namespace')
		this.namespace = namespace + sep
		mkdirp.sync(join(this.path, this.namespace))
	}
	load(name: string) {
		if (this.namespace === undefined)
			throw new Error(
				'You need to define a namespace using Bridge.Store.setup(namespace)'
			)
		return JSON.parse(
			fs.readFileSync(join(this.path, this.namespace, name)).toString()
		)
	}
	save(name: string, data: any) {
		if (this.namespace === undefined)
			throw new Error(
				'You need to define a namespace using Bridge.Store.setup(namespace)'
			)

		let tmp = {}
		try {
			tmp = JSON.stringify(data)
		} catch (e) {
			throw new Error('Provided data is not a valid store content.')
		}
		return fs.writeFileSync(join(this.path, this.namespace, name), tmp)
	}
	exists(name: string) {
		if (this.namespace === undefined)
			throw new Error(
				'You need to define a namespace using Bridge.Store.setup(namespace)'
			)
		return fs.existsSync(join(this.path, this.namespace, name))
	}
}
