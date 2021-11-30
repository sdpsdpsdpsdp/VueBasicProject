/** init domain config */
import './config'

//引入基于ant-design的自定义表单三方库
// import KFormDesign from 'k-form-design/lib/k-form-design-mini.umd.min'
// import 'k-form-design/lib/k-form-design.css'
// Vue.use(KFormDesign)

import Vue from 'vue'

import App from './App.vue'
import Storage from 'vue-ls'
import router from './router'
import store from './store/'
import { VueAxios } from '@/utils/request'
import './assets/iconfont/iconfont.css' //要更新icon库见 ./assets/iconfont/readme.txt
import dataV from '@jiaminghi/data-view'

require('@jeecg/antd-online-mini')
require('@jeecg/antd-online-mini/dist/OnlineForm.css')

import 'element-ui/lib/theme-chalk/index.css'

import Antd, { version } from 'ant-design-vue'
import schema from 'async-validator'
// import { DatePicker } from 'element-ui';
//console.log('ant-design-vue version:', version)

import KFormDesign from './components/kform'
Vue.use(KFormDesign)
import './components/styles/form-design.less'
// import '@/components/kform/index.js'
import Viser from 'viser-vue'
import 'ant-design-vue/dist/antd.less' // or 'ant-design-vue/dist/antd.less'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'

import '@/permission' // permission control
import '@/utils/filter' // base filter
import Print from 'vue-print-nb-jeecg'
/*import '@babel/polyfill'*/
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import SSO from '@/cas/sso.js'

import VueI18n from 'vue-i18n'
import JsonExcel from 'vue-json-excel'
import * as math from 'mathjs'
Vue.prototype.$math = math

Vue.component('downloadExcel', JsonExcel)
//
// import Socket from '@/api/Socket.js'
// Vue.prototype.Socket = Socket
// Vue.prototype.Socket.init()

Vue.use(dataV)

import moment from 'moment'
window.moment = moment
import { ACCESS_TOKEN, DEFAULT_COLOR, DEFAULT_THEME, DEFAULT_LAYOUT_MODE, DEFAULT_COLOR_WEAK, SIDEBAR_TYPE, DEFAULT_FIXED_HEADER, DEFAULT_FIXED_HEADER_HIDDEN, DEFAULT_FIXED_SIDEMENU, DEFAULT_CONTENT_WIDTH_TYPE, DEFAULT_MULTI_PAGE } from '@/store/mutation-types'
import config from '@/defaultSettings'

import JDictSelectTag from './components/dict/index.js'
import hasPermission from '@/utils/hasPermission'
import vueBus from '@/utils/vueBus'
import JeecgComponents from '@/components/jeecg/index'
import '@/assets/less/JAreaLinkage.less'
import VueAreaLinkage from 'vue-area-linkage'
import '@/components/jeecg/JVxeTable/install'
import '@/components/JVxeCells/install'

import ien from '@/assets/lang/en_US'
import izh from '@/assets/lang/zh_CN'
import iar from '@/assets/lang/ar_EG'

import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import enUS from 'ant-design-vue/lib/locale-provider/en_US'
import arEG from 'ant-design-vue/lib/locale-provider/ar_EG'

// import arEG from 'view-design/locale/lang/ar-EG'

import ven from 'view-design/dist/locale/en-US'
import vzh from 'view-design/dist/locale/zh-CN'
import vag from 'view-design/dist/locale/ar-EG'
Vue.config.productionTip = false
Vue.use(Storage, config.storageOptions)
Vue.use(Antd)
Vue.use(VueAxios, router)
Vue.use(Viser)
Vue.use(hasPermission)
Vue.use(JDictSelectTag)
Vue.use(Print)
Vue.use(preview)
Vue.use(vueBus)
Vue.use(JeecgComponents)
Vue.use(VueAreaLinkage)
Vue.use(VueI18n)
// Vue.use(DatePicker);
//Vue.use(Tree);
Vue.use(ViewUI, {
  i18n: (key, value) => i18n.t(key, value)
})

// import * as echarts from 'echarts'
// import Echarts on demond 按需引入
import * as echarts from 'echarts/core'
import 'echarts/theme/macarons.js'
// import 'echarts-gl'
Vue.prototype.$echarts = echarts

// Vue.use(ViewUI, {
//   i18n: function (path, options) {
//     let value = i18n.t(path, options);
//     if (value !== null && value !== undefined) return value;
//     return '';
//   }
// })

const i18n = new VueI18n({
  locale: localStorage.getItem('language') || 'en_US', // set locale  localStorage.getItem('lang') || "en_US"
  silentTranslationWarn: true,
  messages: {
    en_US: {
      ...ien,
      ...enUS,
      ...ven
      // ...enLocale
    },
    zh_CN: {
      ...izh,
      ...zhCN,
      ...vzh
      // ...zhLocale
    },
    ar_EG: {
      ...iar,
      ...arEG,
      ...vag
      // ...zhLocale
    }
  } // set locale messages
})

window.i18n = i18n

localStorage.setItem('language', i18n.locale)
// ElementLocale.i18n((key, value) => i18n.t(key, value))

// 挂载全局使用的方法
import { getAction, postFormAction, postAction, postJSON } from '@/api/manage'

import { basicsList, customComponents } from '@/components/kform/KFormDesign/config/formItemsConfig'
Vue.prototype.postFormAction = postFormAction
Vue.prototype.postJSON = postJSON
Vue.prototype.postDataAction = postAction
Vue.prototype.getAction = getAction
SSO.init(() => {
  main()
})

function main() {
  let v = new Vue({
    router,
    store,
    i18n,
    mounted() {
      store.commit('SET_SIDEBAR_TYPE', Vue.ls.get(SIDEBAR_TYPE, true))
      store.commit('TOGGLE_THEME', Vue.ls.get(DEFAULT_THEME, config.navTheme))
      store.commit('TOGGLE_LAYOUT_MODE', Vue.ls.get(DEFAULT_LAYOUT_MODE, config.layout))
      store.commit('TOGGLE_FIXED_HEADER', Vue.ls.get(DEFAULT_FIXED_HEADER, config.fixedHeader))
      store.commit('TOGGLE_FIXED_SIDERBAR', Vue.ls.get(DEFAULT_FIXED_SIDEMENU, config.fixSiderbar))
      store.commit('TOGGLE_CONTENT_WIDTH', Vue.ls.get(DEFAULT_CONTENT_WIDTH_TYPE, config.contentWidth))
      store.commit('TOGGLE_FIXED_HEADER_HIDDEN', Vue.ls.get(DEFAULT_FIXED_HEADER_HIDDEN, config.autoHideHeader))
      store.commit('TOGGLE_WEAK', Vue.ls.get(DEFAULT_COLOR_WEAK, config.colorWeak))
      store.commit('TOGGLE_COLOR', Vue.ls.get(DEFAULT_COLOR, config.primaryColor))
      store.commit('SET_TOKEN', Vue.ls.get(ACCESS_TOKEN))
      store.commit('SET_MULTI_PAGE', Vue.ls.get(DEFAULT_MULTI_PAGE, config.multipage))
    },
    render: h => h(App)
  }).$mount('#app')
  window.vvv = v
  let f = function wapperschema(oldFun) {
    return function(rules) {
      let that = this
      try {
        if (rules || typeof rules == 'object') {
          for (let z in rules) {
            if (rules.hasOwnProperty(z)) {
              let item = rules[z]

              if (Array.isArray(item)) {
                //数组
                item.forEach(e => {
                  if (e.message) {
                    e.message = window.vvv.$t(e.message)
                  }
                })
              } else if (typeof item === 'object') {
                if (item.message) {
                  item.message = window.vvv.$t(item.message)
                }
              }
            }
          }
        }
      } catch (error) {}
      that.olddefine(rules)
    }
  }
  schema.prototype.olddefine = schema.prototype.define
  schema.prototype.define = f(schema.prototype.olddefine)
  window.aaxx = schema
  // basicsList.forEach(element => {
  //             if(element.rules&&element.rules[0]&&element.rules[0].message){
  //             element.rules[0].message=window.vvv.$t('common.please_input')
  //         }
  // });
  // customComponents.list.forEach(element => {
  //     if(element.rules&&element.rules[0]&&element.rules[0].message){
  //     element.rules[0].message=window.vvv.$t('common.please_input')
  // }
  // });
}
