export function createStyleSheet(styles: string) {
	const styleTag = document.createElement('style')
	styleTag.innerHTML = styles
	document.head.appendChild(styleTag)

	return {
		dispose: () => {
			if (document.head.contains(styleTag))
				document.head.removeChild(styleTag)
		},
	}
}
