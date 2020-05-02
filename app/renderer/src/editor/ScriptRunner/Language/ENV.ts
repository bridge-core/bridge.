import { languages } from 'monaco-editor'
import Provider from '../../../autoCompletions/Provider'
import { IDisposable } from '../../../Types/disposable'
const PROVIDER = new Provider()

export const ENV = (disposables: IDisposable[], language: string) => {
	languages.register({ id: language })

	return {
		AutoCompletions: {
			eval(path: string) {
				return PROVIDER.omegaExpression(path)
			},
			get(path: string) {
				return PROVIDER.get(path)
			},
		},
		registerTokens(tokens: languages.IMonarchLanguage) {
			disposables.push(
				languages.setMonarchTokensProvider(language, tokens)
			)
		},
		registerCompletionProvider(
			provider: () => languages.ProviderResult<languages.CompletionList>
		) {
			console.log(disposables)
			disposables.push(
				languages.registerCompletionItemProvider(language, {
					provideCompletionItems: provider,
				})
			)
			// disposables.pop().dispose()
		},
	}
}
