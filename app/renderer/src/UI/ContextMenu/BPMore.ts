import ProjectConfig from '../../Project/Config'
import InputWindow from '../Windows/Common/Input'
import { CURRENT, MOJANG_PATH } from '../../constants'
import InformationWindow from '../Windows/Common/Information'
import LoadingWindow from '../../../windows/LoadingWindow'
import { join } from 'path'
import trash from 'trash'
import { remote } from 'electron'
import ConfirmWindow from '../Windows/Common/Confirm'
import EventBus from '../../EventBus'
import { promises as fs } from 'fs'
import { refreshCache } from '../../Project/RefreshCache'
import { zip } from 'zip-a-folder'
import { createNotification } from '../Footer/create'

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

			new InputWindow(
				{
					header: 'Project Namespace',
					label: 'Namespace',
					text: prefix,
				},
				val => {
					ProjectConfig.setPrefix(val)
				}
			)
		},
	},
	{
		icon: 'mdi-reload',
		title: 'Refresh Cache',
		action: async () => {
			let win = new LoadingWindow()
			console.log('REFRESH BP')
			await refreshCache(false)
			console.log('REFRESH RP')
			await refreshCache(true, false)
			console.log('DONE')
			win.close()
		},
	},
	{
		icon: 'mdi-package-variant-closed',
		title: 'Package Project',
		action: async () => {
			new ConfirmWindow(
				() => {
					new InputWindow(
						{
							header: 'Project Name',
							label: 'Name',
							text: '',
						},
						async project_name => {
							//Make sure that the resource pack can be loaded
							if (!CURRENT.RESOURCE_PACK)
								return new InformationWindow(
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
				() => {},
				'Please backup your project before packaging it!'
			)
		},
	},
	{
		icon: 'mdi-delete',
		title: 'Delete Project',
		action: () => {
			new ConfirmWindow(
				async () => {
					let lw = new LoadingWindow()
					await trash(CURRENT.PROJECT_PATH)
					EventBus.trigger('bridge:findDefaultPack', true)
					lw.close()
				},
				null,
				'Do you really want to delete this project?'
			)
		},
	},
]
