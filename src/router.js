import Vue from 'vue'
import Router from 'vue-router'
import Home from './components/Home'

Vue.use(Router)

export default new Router({
	base: process.env.environment === 'development' ? '/' : '/waves-codes/',
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
  ]
})
