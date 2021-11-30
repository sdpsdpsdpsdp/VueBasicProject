import Vue from 'vue'
import { login, logout, phoneLogin, thirdLogin } from '@/api/login'
import {
  ACCESS_TOKEN,
  USER_NAME,
  USER_INFO,
  USER_AUTH,
  SYS_BUTTON_AUTH,
  UI_CACHE_DB_DICT_DATA,
  TENANT_ID,
  CACHE_INCLUDED_ROUTES
} from '@/store/mutation-types'
import { welcome } from '@/utils/util'
import { queryPermissionsByUser } from '@/api/api'
//import { getLoginUser } from '@/api/login'
import { getAction } from '@/api/manage'

import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN'
import en_US from 'ant-design-vue/lib/locale-provider/en_US'
import ar_EG from 'ant-design-vue/lib/locale-provider/ar_EG'

let locale = en_US
if (localStorage.getItem('language') === 'zh_CN') {
  locale = zh_CN
} else if (localStorage.getItem('language') === 'en_US') {
  locale = en_US
} else if (localStorage.getItem('language') === 'ar_EG') {
  locale = ar_EG
}

const user = {
  state: {
    token: '',
    username: '',
    realname: '',
    tenantid: '',
    welcome: '',
    avatar: '',
    permissionList: [],
    info: {},
    local: locale
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_LOCAL: (state, local) => {
      state.local = local
    },
    SET_NAME: (state, { username, realname, welcome }) => {
      state.username = username
      state.realname = realname
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_PERMISSIONLIST: (state, permissionList) => {
      state.permissionList = permissionList
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_TENANT: (state, id) => {
      state.tenantid = id
    }
  },

  actions: {
    // CAS验证登录
    ValidateLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        getAction('/sys/cas/client/validateLogin', userInfo)
          .then(response => {
            console.log('----cas 登录--------', response)
            if (response.success) {
              const result = response.result
              const userInfo = result.userInfo
              Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
              Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
              Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
              commit('SET_TOKEN', result.token)
              commit('SET_INFO', userInfo)
              commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
              commit('SET_AVATAR', userInfo.avatar)
              resolve(response)
            } else {
              resolve(response)
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then(response => {
            if (response.access_token) {
              console.log(response)
              // const result = response.result
              // const userInfo = result.userInfo
              Vue.ls.set(ACCESS_TOKEN, response.access_token, 7 * 24 * 60 * 60 * 1000)
              // Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
              // Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
              // Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
              commit('SET_TOKEN', response.access_token)

              // commit('SET_NAME', { username: userInfo.username,realname: userInfo.realname, welcome: welcome() })
              // commit('SET_AVATAR', userInfo.avatar)
              resolve(response)
            } else {
              reject(response)
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // //手机号登录
    // PhoneLogin({ commit }, userInfo) {
    //   return new Promise((resolve, reject) => {
    //       phoneLogin(userInfo).then(response => {
    //       if(response.code =='200'){
    //     const result = response.result
    //     const userInfo = result.userInfo
    //     Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
    //     Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
    //     Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
    //     Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
    //     commit('SET_TOKEN', result.token)
    //     commit('SET_INFO', userInfo)
    //     commit('SET_NAME', { username: userInfo.username,realname: userInfo.realname, welcome: welcome() })
    //     commit('SET_AVATAR', userInfo.avatar)
    //     resolve(response)
    //   }else{
    //     reject(response)
    //   }
    // }).catch(error => {
    //     reject(error)
    //   })
    // })
    // },
    // 获取用户信息
    GetPermissionList({ commit }) {
      return new Promise((resolve, reject) => {
        queryPermissionsByUser()
          .then(response => {
            console.log(response, '888888888888')
            window.localStorage.setItem('language', response.data.language) //设置localstorage
            window.vvv._i18n.locale = response.data.language //设置当前会话的语言
            let hasMenu = false
            commit('SET_INFO', response.data)
            commit('SET_AVATAR', response.data.avatar)
            console.log(response.data.avatar, '3333')

            response.data.sysMenu.children.forEach(i => {
              if (i.id == '1') {
                commit('SET_PERMISSIONLIST', i.children)
                hasMenu = true
              }
            })

            const authData = response.data.realname
            // const allAuthData = response.result.allAuth;
            //Vue.ls.set(USER_AUTH,authData);
            sessionStorage.setItem(USER_AUTH, JSON.stringify(authData))

            if (!hasMenu) {
              reject('getPermissionList: permissions must be a non-null array !')
            }

            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise(resolve => {
        let logoutToken = state.token
        commit('SET_TOKEN', '')
        commit('SET_PERMISSIONLIST', [])
        Vue.ls.remove(ACCESS_TOKEN)
        Vue.ls.remove(UI_CACHE_DB_DICT_DATA)
        Vue.ls.remove(CACHE_INCLUDED_ROUTES)
        Vue.ls.clear()
        logout(logoutToken)
          .then(res => {
            console.log(res)
            if (process.env.VUE_APP_SSO == 'true') {
              let sevice = 'http://' + window.location.host + '/'
              let serviceUrl = encodeURIComponent(sevice)
              window.location.href = process.env.VUE_APP_CAS_BASE_URL + '/logout?service=' + serviceUrl
            }
            resolve()
          })
          .catch(() => {
            resolve()
          })
      })
    },
    // 第三方登录
    ThirdLogin({ commit }, param) {
      return new Promise((resolve, reject) => {
        thirdLogin(param.token, param.thirdType)
          .then(response => {
            if (response.code == '200') {
              const result = response.result
              const userInfo = result.userInfo
              Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
              Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
              Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
              commit('SET_TOKEN', result.token)
              commit('SET_INFO', userInfo)
              commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
              commit('SET_AVATAR', userInfo.avatar)
              resolve(response)
            } else {
              reject(response)
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    saveTenant({ commit }, id) {
      Vue.ls.set(TENANT_ID, id, 7 * 24 * 60 * 60 * 1000)
      commit('SET_TENANT', id)
    },
    editLocal({ commit }, local) {
      commit('SET_LOCAL', local)
    }
  }
}

export default user
