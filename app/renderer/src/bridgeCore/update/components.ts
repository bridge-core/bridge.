import PluginLoader from '../../plugins/PluginLoader'
import ComponentRegistry from '../../plugins/CustomComponents'
import GlobalPluginLoader from '../../plugins/GlobalPluginLoader'

export async function updateCustomComponent(str: string, filePath: string) {
	await PluginLoader.loadComponent(filePath, str)
	await GlobalPluginLoader.loadComponent(filePath, str)
	await ComponentRegistry.updateFiles()
	return str
}
