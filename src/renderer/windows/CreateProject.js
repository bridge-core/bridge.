import fs from 'fs'
import ContentWindow from '../scripts/commonWindows/Content'
import { BASE_PATH, RP_BASE_PATH } from '../scripts/constants'
import Vue from '../main'
import LoadingWindow from './LoadingWindow'
import Manifest from '../scripts/files/Manifest'
import uuidv4 from 'uuid/v4'
import CreateFiles from '../scripts/Project/CreateFiles'
import path from 'path'
import EventBus from '../scripts/EventBus'

export default class CreateProjectWindow extends ContentWindow {
	constructor(create_bp = true, cb) {
		const DEFAULT_TEXT = `${
			create_bp ? 'Projects' : 'Resource packs'
		} are stored directly inside the "${
			create_bp
				? 'development_behavior_packs'
				: 'development_resource_packs'
		}" folder.`

		super({
			display_name: create_bp ? 'New Project' : 'New Resource Pack',
			options: {
				is_persistent: false,
				height: 280,
			},
		})

		this.content = [
			{
				type: 'input',
				key: uuidv4(),
				has_focus: true,
				text: `${create_bp ? 'Project' : 'Resource Pack'} Name`,
				color: 'primary',

				action: {
					enter: () => {
						this.createProject(create_bp, cb)
					},
					default: val => {
						if (val === '') {
							this.content[0].color = 'error'
							this.content[2].color = 'error'
							this.content[2].text = `Please enter a valid ${
								create_bp ? 'project' : 'resource pack'
							} name!`
							this.actions[1].is_disabled = true
							this.update({
								content: this.content,
								actions: this.actions,
							})
						} else {
							this.content[0].color = 'primary'
							this.content[2].color = 'grey'
							this.content[2].text = DEFAULT_TEXT
							if (this.des !== '')
								this.actions[1].is_disabled = false
							this.update({
								content: this.content,
								actions: this.actions,
							})
						}
						this.input = val
					},
				},
			},
			{
				type: 'input',
				key: uuidv4(),
				text: `${create_bp ? 'Project' : 'Resource Pack'} Description`,
				color: 'primary',

				action: {
					enter: () => {
						this.createProject(create_bp, cb)
					},
					default: val => {
						if (val === '') {
							this.content[1].color = 'error'
							this.content[2].color = 'error'
							this.content[2].text = `Please enter a valid ${
								create_bp ? 'project' : 'resource pack'
							} description!`
							this.actions[1].is_disabled = true
							this.update({
								content: this.content,
								actions: this.actions,
							})
						} else {
							this.content[1].color = 'primary'
							this.content[2].color = 'grey'
							this.content[2].text = DEFAULT_TEXT
							if (this.input !== '')
								this.actions[1].is_disabled = false
							this.update({
								content: this.content,
								actions: this.actions,
							})
						}
						this.des = val
					},
				},
			},
			{
				text: DEFAULT_TEXT,
				color: 'grey',
			},
			{
				type: 'divider',
			},
			create_bp
				? {
						type: 'switch',
						color: 'primary',
						text: 'Register client data',
						action: val => {
							this.client_data = val
						},
				  }
				: {},
		]
		this.actions = [
			{
				type: 'space',
			},
			{
				type: 'button',
				text: 'Create!',
				color: 'primary',
				is_disabled: true,
				is_rounded: false,
				action: () => this.createProject(create_bp, cb),
			},
		]

		this.input = ''
		this.des = ''
		this.client_data = false
		this.update({
			content: this.content,
			actions: this.actions,
		})
	}

	createProject(create_bp, cb) {
		if (this.input == '' || this.des == '') {
			this.content[2].color = 'error'
			this.content[2].text = `Please enter a valid ${
				create_bp ? 'project' : 'resource pack'
			} name and description!`
			this.update({
				content: this.content,
			})

			return
		}
		this.close()
		let l_w = new LoadingWindow('project.').show()
		let b_path = create_bp ? BASE_PATH : RP_BASE_PATH

		window.setTimeout(() => {
			fs.mkdir(b_path + this.input, { recursive: true }, err => {
				if (err && err.message.includes('already exists'))
					return l_w.hide()
				if (err) {
					l_w.hide()
					throw err
				}

				fs.writeFile(
					path.join(b_path, this.input, '/manifest.json'),
					new Manifest(
						create_bp ? 'data' : 'resources',
						this.client_data
					).get(),
					async () => {
						if (err && err.message.includes('already exists'))
							return l_w.hide()
						if (err) {
							l_w.hide()
							throw err
						}

						//CREATE DEFAULT FILES
						if (!create_bp)
							await CreateFiles.createRPFiles(
								path.join(b_path, this.input),
								{
									name: this.input,
									description: this.des,
								}
							)
						else
							await CreateFiles.createBPFiles(
								path.join(b_path, this.input),
								{
									name: this.input,
									description: this.des,
								}
							)

						Vue.$root.$emit('refreshExplorer')

						l_w.hide()
						if (typeof cb === 'function') cb(this.input)
						if (create_bp)
							EventBus.trigger('bridge:selectProject', this.input)
					}
				)
			})
		}, 50)
	}
}
