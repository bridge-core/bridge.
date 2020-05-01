import InputWindow from '../../src/UI/Windows/Common/Input'
import SearchListView from './SearchListView'

export default class SearchDebugLogInput extends InputWindow {
	constructor(parent) {
		super(
			{
				header: 'Search Debug Log',
				label: 'Search',
			},
			val => {
				if (parent) parent.close()
				new SearchListView(val)
			}
		)
	}
}
