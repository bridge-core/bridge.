export function createStyleSheet(styles: string) {
	const styleTag = document.createElement('style')
	styleTag.innerHTML = styles
	document.head.appendChild(styleTag)

	return {
		dispose: () => {
			document.head.removeChild(styleTag)
		},
	}
}
