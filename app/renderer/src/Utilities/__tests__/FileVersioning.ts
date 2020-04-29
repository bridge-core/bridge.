import { stripFileVersion } from '../FileVersioning'

describe('FileVersioning', () => {
	test('stripFileVersion', () => {
		expect(stripFileVersion('')).toBe('')
		expect(stripFileVersion('//bridge-file-version: #0\n')).toBe('')
		expect(
			stripFileVersion('#bridge-file-version: #1391393954\nHello World!')
		).toBe('Hello World!')
		expect(
			stripFileVersion('//bridge-file-version: #1391393954\nHello World!')
		).toBe('Hello World!')
	})
})
