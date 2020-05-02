import { languages } from 'monaco-editor'
import Provider from '../../../autoCompletions/Provider'
const PROVIDER = new Provider()

export const ENV = (language: string) => {
	languages.register({ id: language })

	return {
		AutoCompletions: {
			eval(path: string) {
				return PROVIDER.omegaExpression(path)
			},
		},
		registerTokens(tokens: languages.IMonarchLanguage) {
			languages.setMonarchTokensProvider(language, tokens)
		},
		registerCompletionProvider(
			provider: () => languages.ProviderResult<languages.CompletionList>
		) {
			languages.registerCompletionItemProvider(language, {
				provideCompletionItems: provider,
			})
		},
	}
}
