/**
 * Implements JSONNode (JSONTree.js) shortcuts
 */
import TabSystem from '../TabSystem'
import { clipboard } from 'electron'
import { JSONAction } from '../TabSystem/CommonHistory'
import JSONTree from './JsonTree'
import Store from '../../store/index'

export default class NodeShortcuts {
	private static transformKey(str: string, node: JSONTree): string {
		let match = str.match(/(.+_)(\d+)/)
		if (match !== null) {
			return match[1] + (Number(match[2]) + 1)
		} else if (node.hasChild(str)) {
			str += '_copy'
		}
		return str
	}

	static execPaste(alternative_paste = false) {
		console.log(
			Store.state.Settings.is_alternative_append_with_copy,
			alternative_paste
		)

		if (Store.state.Settings.is_alternative_append_with_copy)
			return alternative_paste ? this.paste() : this.classicPaste()
		else return alternative_paste ? this.classicPaste() : this.paste()
	}

	static classicPaste() {
		let node = TabSystem.getCurrentNavObj()
		if (node === undefined || node.data !== '') return

		try {
			node.buildFromObject(
				JSON.parse(clipboard.readText()),
				undefined,
				true
			)
			TabSystem.setCurrentUnsaved()
			return true
		} catch (e) {
			//Try again with a fix if the key was still in front
			try {
				node.buildFromObject(
					JSON.parse('{' + clipboard.readText() + '}'),
					undefined,
					true
				)
				TabSystem.setCurrentUnsaved()
				return true
			} catch (e) {
				return false
			}
		}
	}

	static paste() {
		let node = TabSystem.getCurrentNavObj()
		if (node === undefined || node.data !== '') return

		try {
			let obj = JSON.parse(clipboard.readText())
			let res: any = {}
			for (let key in obj) res[this.transformKey(key, node)] = obj[key]

			node.buildFromObject(res, undefined, true)
			TabSystem.setCurrentUnsaved()
			return true
		} catch (e) {
			//Try again with a fix if the key was still in front
			try {
				let obj = JSON.parse('{' + clipboard.readText() + '}')
				let res: any = {}
				for (let key in obj)
					res[this.transformKey(key, node)] = obj[key]

				node.buildFromObject(res, undefined, true)
				TabSystem.setCurrentUnsaved()
				return true
			} catch (e) {
				return false
			}
		}
	}
	static copy(node = TabSystem.getCurrentNavObj()) {
		try {
			let obj = { [node.key]: node.toJSON() }
			clipboard.writeText(JSON.stringify(obj, null, '\t'))
			return true
		} catch (e) {
			return false
		}
	}
	static cut() {
		try {
			let node = TabSystem.getCurrentNavObj()
			//HISTORY
			TabSystem.getHistory().add(new JSONAction('add', node.parent, node))

			if (this.copy(node)) {
				TabSystem.deleteCurrent()
				TabSystem.setCurrentFileNav('global')
				TabSystem.setCurrentUnsaved()
			}
		} catch (e) {}
	}
}
