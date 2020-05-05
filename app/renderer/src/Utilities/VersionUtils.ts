/**
 * Utilities for comparing versions
 * e.g. v0.1.0 <-> v2.1.20
 */
import { compare } from 'compare-versions'

export function greaterThan(v1: string, v2: string) {
	return compare(v1, v2, '>')
}
export function lessThan(v1: string, v2: string) {
	return compare(v1, v2, '<')
}
