export function stripFileVersion(str: string) {
	return str.replace(/(\/\/|#)bridge-file-version: #[0-9]+\n/, '')
}
