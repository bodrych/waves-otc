import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'

Vue.use(Router)

export default new Router({
	base: process.env.environment === 'development' ? '/' : '/otc/',
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      // props: (route) => ({ pair: { amountAsset: route.query.amountAsset, priceAsset: route.query.priceAsset } })
    },
  ]
})
