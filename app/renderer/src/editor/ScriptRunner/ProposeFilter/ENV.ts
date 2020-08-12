import { compare } from 'compare-versions'
import ProjectConfig from '../../../Project/Config'

export const ENV = (item: string) => {
	return {
		Item: item,
		Version: {
			ProjectTarget: ProjectConfig.getFormatVersionSync(),
			compare,
		},
	}
}
