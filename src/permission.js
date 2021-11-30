import Vue from 'vue'
import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import notification from 'ant-design-vue/es/notification'
import { ACCESS_TOKEN, INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types'
import { generateIndexRouter } from '@/utils/util'
import { getLoginUser } from '@/api/login'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/dashboard/bigscreen', '/test/cesium', '/user/login', '/user/register', '/user/register-result', '/user/alteration'] // no redirect whitelist

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  //("dsfsdf")
  let token = Vue.ls.get(ACCESS_TOKEN)
  if (whiteList.indexOf(to.path) !== -1) {
    // 在免登录白名单，直接进入
    next()
  } else {
    if (Vue.ls.get(ACCESS_TOKEN)) {
      /* has token */
      if (to.path === '/user/login') {
        next({ path: INDEX_MAIN_PAGE_PATH })
        NProgress.done()
      } else {
        if (store.getters.permissionList.length === 0) {
          //用vuex里的方法请求用户的菜单，所以页面刷新后会重新执行
          store
            .dispatch('GetPermissionList')
            .then(res => {
              let menuData
              res.data.sysMenu.children.forEach(i => {
                if (i.id == '1') {
                  menuData = i.children
                }
              })
              if (menuData === null || menuData === '' || menuData === undefined) {
                return
              }
              let constRoutes = []
              constRoutes = generateIndexRouter(menuData)
              console.log('产生了路由', constRoutes)
              window.rr = constRoutes
              // 添加主界面路由
              store.dispatch('UpdateAppRouter', { constRoutes }).then(() => {
                // 根据roles权限生成可访问的路由表
                // 动态添加可访问路由表
                router.addRoutes(store.getters.addRouters)
                window.rrr = router
                const redirect = decodeURIComponent(from.query.redirect || to.path)
                if (to.path === redirect) {
                  // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
                  next({ ...to, replace: true })
                } else {
                  // 跳转到目的路由
                  next({ path: redirect })
                }
              })
            })
            .catch(() => {
              next()
              /* notification.error({
                message: '系统提示',
                description: '请求用户信息失败，请重试！'
                })*/
              // store.dispatch('Logout').then(() => {
              //   next({ path: '/user/login', query: { redirect: to.fullPath } })
              // })
            })
        } else {
          next()
        }
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        // 在免登录白名单，直接进入
        next()
      } else {
        if (to.path !== '/user/login') {
          next({ path: '/user/login', query: { redirect: to.fullPath } })
          NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
        } else {
          next()
        }
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
