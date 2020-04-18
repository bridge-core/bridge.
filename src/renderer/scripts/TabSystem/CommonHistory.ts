import Store from '../../store/index'
import ProblemIterator from '../editor/problems/Problems'
import TabSystem from '../TabSystem'
import JSONTree from '../editor/JsonTree'

export type CommitType = 'add' | 'remove' | 'edit-key' | 'edit-data'

/**
 * @class History
 */
export class History {
	private undo_arr: Action[]
	private redo_arr: Action[]
	constructor() {
		this.undo_arr = []
		this.redo_arr = []
	}

	updateError() {
		if (Store.state.Settings.when_error === 'On File Change') {
			setTimeout(() => ProblemIterator.repeatLast(), 10)
		}
	}

	/**
	 * Adds an action to the undo queue
	 * @param {Action} action Action to add to the undo queue
	 */
	add(action: Action) {
		this.updateError()

		if (this.undo_arr.length === 0) return this.undo_arr.unshift(action)
		this.undo_arr[0].push(this.undo_arr, action)
	}

	/**
	 * Commits an undo-action
	 */
	undo() {
		let undo = this.undo_arr.shift()
		if (undo === undefined) return false

		this.redo_arr.unshift(undo.reverse())
		undo.commit()
		TabSystem.setCurrentFileNav('global')
		TabSystem.setCurrentUnsaved()

		this.updateError()
		return true
	}
	/**
	 * Commits a redo-action
	 */
	redo() {
		let redo = this.redo_arr.shift()
		if (redo === undefined) return false

		this.undo_arr.unshift(redo.reverse())
		redo.commit()
		TabSystem.setCurrentFileNav('global')
		TabSystem.setCurrentUnsaved()

		this.updateError()
		return true
	}

	/**
	 * Clears the current history
	 */
	clear() {
		this.undo_arr = []
		this.redo_arr = []
	}
	/**
	 * Clears the current undo history
	 */
	clearUndo() {
		this.undo_arr = []
	}
	/**
	 * Clears the current redo history
	 */
	clearRedo() {
		this.redo_arr = []
	}
}

export class Action {
	/**
	 * Commits an action & returns current action object
	 * @abstract
	 * @returns {Action}
	 */
	commit() {
		return this
	}
	/**
	 * Creates a new action object which has the opposite effect of the calling object
	 * @abstract
	 * @returns {Action}
	 */
	reverse() {
		return new Action()
	}
	/**
	 * Called on first object in "arr" upon trying to push a new action
	 * @abstract
	 * @param {Array<Action>} arr
	 * @param {Action} action
	 */
	push(arr: Action[], action: Action) {
		arr.unshift(action)
	}
}

export class JSONAction extends Action {
	private type: CommitType
	private context: JSONTree
	private data: any

	constructor(type: CommitType, context: JSONTree, data: any) {
		super()
		this.type = type
		this.context = context
		this.data = data
	}

	commit() {
		if (this.type === 'add') this.context.add(this.data)
		else if (this.type === 'remove') this.context.removeNode(this.data)
		else if (this.type === 'edit-key') {
			this.context.editKey(this.data)
			TabSystem.setCurrentFileNav('global')
		} else if (this.type === 'edit-data') {
			this.context.edit(this.data)
			TabSystem.setCurrentFileNav('global')
		}
		this.context.updateUUID()
		return this
	}

	reverse() {
		if (this.type === 'add')
			return new JSONAction('remove', this.context, this.data)
		else if (this.type === 'remove')
			return new JSONAction('add', this.context, this.data)
		else if (this.type === 'edit-key')
			return new JSONAction('edit-key', this.context, this.context.key)
		else if (this.type === 'edit-data')
			return new JSONAction('edit-data', this.context, this.context.data)
		else throw new Error('Unknown commit type')
	}
}

export class MoveAction extends Action {
	protected context1: JSONTree
	protected context2: JSONTree
	private child: JSONTree

	constructor(context1: JSONTree, context2: JSONTree, child: JSONTree) {
		super()

		this.context1 = context1
		this.context2 = context2
		this.child = child
	}

	commit() {
		this.context1.removeNode(this.child)
		this.context2.add(this.child)
		return this
	}

	reverse() {
		return new MoveAction(this.context2, this.context1, this.child)
	}

	push(arr: Action[], action: Action) {
		if (action instanceof MoveAction) {
			if (this.context1 === undefined) {
				this.context1 = action.context1
			} else if (this.context2 === undefined) {
				this.context2 = action.context2
			}
		} else {
			super.push(arr, action)
		}
	}
}
