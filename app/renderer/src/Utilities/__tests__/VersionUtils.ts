import { greaterThan, lessThan } from '../VersionUtils'

describe('VersionUtils', () => {
	test('lessThan', () => {
		expect(lessThan('1.0.0', 'v1.0.0')).toBe(false)
		expect(lessThan('v1.0.0', '0.9.0')).toBe(false)
		expect(lessThan('v0.999.0', '1.0.0')).toBe(true)
	})
	test('greaterThan', () => {
		expect(greaterThan('1.0.22', 'v1.0.22')).toBe(false)
		expect(greaterThan('v1.1.0', '0.9.6')).toBe(true)
		expect(greaterThan('v0.999.4', '1.0.7')).toBe(false)

		expect(greaterThan('v1.7.0', '1.7.0-pre1')).toBe(true)
		expect(greaterThan('v1.7.0-pre2', '1.7.0-pre1')).toBe(true)
		expect(greaterThan('v1.7.1', '1.7.0-pre1')).toBe(true)
		expect(greaterThan('v1.6.0', '1.7.0-pre1')).toBe(false)
		expect(greaterThan('v1.7.0-pre10', '1.7.0')).toBe(false)
	})
})
