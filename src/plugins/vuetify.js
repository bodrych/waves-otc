import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import store from '@/store';

Vue.use(Vuetify);

export default new Vuetify({
	icons: {
		iconfont: 'mdi',
	},
	theme: {
		dark: store.getters.getDarkTheme,
		themes: {
			light: {
				accent: '#424242',
			},
			dark: {
				accent: '#ffffff',
			},
		}
	},
});
