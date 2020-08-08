import ProjectConfig from '../../Project/Config'
import { CURRENT, MOJANG_PATH } from '../../constants'
import LoadingWindow from '../../../windows/LoadingWindow'
import { join } from 'path'
import trash from 'trash'
import { remote } from 'electron'
import EventBus from '../../EventBus'
import { promises as fs } from 'fs'
import { refreshCache } from '../../Project/RefreshCache'
import { zip } from 'zip-a-folder'
import { createNotification } from '../Footer/create'
import { getFormatVersions } from '../../autoCompletions/components/VersionedTemplate/Common'
import {
	createInformationWindow,
	createInputWindow,
	createDropdownWindow,
	createConfirmWindow,
} from '../Windows/Common/CommonDefinitions'

export default [
	{
		icon: 'mdi-rename-box',
		title: 'Project Namespace',
		action: async () => {
			let prefix
			try {
				prefix = await ProjectConfig.prefix
			} catch (e) {
				prefix = 'bridge'
			}

			createInputWindow(
				'Project Namespace',
				'Namespace',
				prefix,
				'',
				val => ProjectConfig.setPrefix(val)
			)
		},
	},
	{
		icon: 'mdi-numeric',
		title: 'Project Target Version',
		action: async () => {
			let formatVersion
			try {
				formatVersion = await ProjectConfig.formatVersion
			} catch (e) {
				formatVersion = '1.13.0'
			}

			createDropdownWindow(
				'Project Format Version',
				'Format Version',
				getFormatVersions().reverse(),
				formatVersion,
				val => {
					ProjectConfig.setFormatVersion(val)
				}
			)
		},
	},
	{
		icon: 'mdi-reload',
		title: 'Refresh Cache',
		action: async () => {
			let win = new LoadingWindow()
			await refreshCache(false)
			await refreshCache(true, false)
			win.close()
		},
	},
	{
		icon: 'mdi-package-variant-closed',
		title: 'Package Project',
		action: async () => {
			createConfirmWindow(
				'Please backup your project before packaging it!',
				'Confirm',
				'Cancel',
				() => {
					createInputWindow(
						'Project Name',
						'Name',
						'',
						'',
						async project_name => {
							//Make sure that the resource pack can be loaded
							if (!CURRENT.RESOURCE_PACK)
								return createInformationWindow(
									'No Resource Pack',
									'Please connect a resource pack before packaging the whole project.'
								)

							//Package whole project
							let lw = new LoadingWindow()
							await fs.mkdir(
								join(MOJANG_PATH, 'bridge_proj_tmp'),
								{
									recursive: true,
								}
							)
							await Promise.all([
								zip(
									CURRENT.PROJECT_PATH,
									join(
										MOJANG_PATH,
										'bridge_proj_tmp',
										`${CURRENT.PROJECT}.mcpack`
									)
								),
								zip(
									CURRENT.RP_PATH,
									join(
										MOJANG_PATH,
										'bridge_proj_tmp',
										`${CURRENT.RESOURCE_PACK}.mcpack`
									)
								),
							])
							await zip(
								join(MOJANG_PATH, 'bridge_proj_tmp'),
								join(MOJANG_PATH, `${project_name}.mcaddon`)
							)
							await trash(join(MOJANG_PATH, 'bridge_proj_tmp'))
							lw.close()

							//Notify user the packaging is complete
							const readyPush = createNotification({
								icon: 'mdi-package-variant-closed',
								message: 'Package ready!',
								color: 'info',
								onClick: () => {
									readyPush.dispose()
									remote.shell.showItemInFolder(
										join(
											MOJANG_PATH,
											`${project_name}.mcpack`
										)
									)
								},
							})
						}
					)
				},
				() => {}
			)
		},
	},
	{
		icon: 'mdi-delete',
		title: 'Delete Project',
		action: () => {
			createConfirmWindow(
				'Do you really want to delete this project?',
				'Confirm',
				'Cancel',
				async () => {
					let lw = new LoadingWindow()
					await trash(CURRENT.PROJECT_PATH)
					EventBus.trigger('bridge:findDefaultPack', true)
					lw.close()
				},
				() => {}
			)
		},
	},
]
