import PluginLoader from '../../plugins/PluginLoader'
import ComponentRegistry from '../../plugins/CustomComponents'

export async function updateCustomComponent(str: string, filePath: string) {
	await PluginLoader.loadComponent(filePath, [], str)
	await ComponentRegistry.updateFiles()
	return str
}
