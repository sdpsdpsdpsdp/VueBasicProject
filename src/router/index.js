import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap,
})
router.$addRoutes = (params) => {
  router.matcher = new Router({mode: 'history'}).matcher;
  router.addRoutes(params)
}

export default router