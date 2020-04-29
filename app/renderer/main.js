import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import VueCodeMirror from 'vue-codemirror'
import App from './App'
import store from './store'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)
Vue.use(VueCodeMirror)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

const vuetify = new Vuetify({
	theme: {
		options: {
			customProperties: true,
		},
		themes: {
			dark: {
				primary: '#1778D2',
				secondary: '#1778D2',

				background: '#121212',
				sidebar_navigation: '#1F1F1F',
				expanded_sidebar: '#1F1F1F',
				menu: '#1F1F1F',
				menu: '#424242',
				footer: '#111111',
				tooltip: '#1F1F1F',
			},
			light: {
				primary: '#1778D2',
				secondary: '#1778D2',

				background: '#fafafa',
				sidebar_navigation: '#FFFFFF',
				expanded_sidebar: '#FFFFFF',
				tooltip: '#424242',
				toolbar: '#e0e0e0',
				footer: '#f5f5f5',
			},
		},
	},
})

export default new Vue({
	components: {
		App,
	},
	vuetify,
	store,
	template: '<App/>',
}).$mount('#app')
