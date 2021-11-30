import { UserLayout, TabLayout, RouteView, BlankLayout, PageView } from '@/components/layouts'
// import bigscreen from '@/views/bigscreen/index'
/**
 * 走菜单，走权限控制
 * @type {[null,null]}
 */
export const asyncRouterMap = [
  {
    path: '/',
    name: 'dashboard',
    component: TabLayout,
    meta: { title: '首页' },
    redirect: '/system/sysrolelist',
    // redirect: '/user/Login',
    children: []
  },

  {
    path: '*',
    redirect: '/',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/register/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/register/RegisterResult')
      },
      {
        path: 'alteration',
        name: 'alteration',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/alteration/Alteration')
      }
    ]
  },
  // {
  //   path: '/dashboard/bigscreen',
  //   name: '大屏',
  //   component: bigscreen,
  //   meta: { title: '大屏' },
  //   children: []
  // },
  // {
  //   path: '/test',
  //   component: BlankLayout,
  //   redirect: '/test/home',
  //   children: [
  //     {
  //       path: 'home',
  //       name: 'TestHome',
  //       component: () => import('@/views/Home')
  //     },
  //     {
  //       path: 'cesium',
  //       name: 'cesium',
  //       component: () => import('@/extends/cesium/CesiumDemo.vue')
  //     }
  //   ]
  // },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
