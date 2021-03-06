import Vue from 'vue'
import { axios } from '@/utils/request'

const api = {
  user: '/mock/api/user',
  role: '/mock/api/role',
  service: '/mock/api/service',
  permission: '/mock/api/permission',
  permissionNoPager: '/mock/api/permission/no-pager'
}

export default api

//post
export function postAction(url, parameter) {
  return axios({
    url: url,
    method: 'post',
    data: parameter
  })
}

//post json
export function postJSON(url, data) {
  return axios({
    url: url,
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function getJSON(url, data) {
  return axios({
    url: url,
    method: 'get',
    data: data
  })
}

//post method= {post | put}
export function httpAction(url, parameter, method) {
  return axios({
    url: url,
    method: method,
    data: parameter
  })
}

//put
export function putAction(url, parameter) {
  return axios({
    url: url,
    method: 'put',
    data: parameter
  })
}

//get
export function getAction(url, parameter) {
  return axios({
    url: url,
    method: 'get',
    params: parameter
  })
}

//post
export function postFormAction(url, parameter) {
  return axios({
    url: url,
    method: 'post',
    params: parameter
  })
}

//deleteAction
export function deleteAction(url, parameter = '') {
  return axios({
    url: url,
    method: 'delete',
    params: parameter
  })
}

export function getUserList(parameter) {
  return axios({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList(parameter) {
  return axios({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList(parameter) {
  return axios({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions(parameter) {
  return axios({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService(parameter) {
  return axios({
    url: api.service,
    method: parameter.id == 0 ? 'post' : 'put',
    data: parameter
  })
}

/**
 * ???????????? ??????excel??????
 * @param url
 * @param parameter
 * @returns {*}
 */
export function downFile(url, parameter) {
  return axios({
    url: url,
    params: parameter,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * ????????????
 * @param url ????????????
 * @param fileName ?????????
 * @param parameter
 * @returns {*}
 */
export function downloadFile(url, fileName, parameter) {
  return downFile(url, parameter).then((data) => {
    if (!data || data.size === 0) {
      Vue.prototype['$message'].warning('??????????????????')
      return
    }
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      window.navigator.msSaveBlob(new Blob([data]), fileName)
    } else {
      let url = window.URL.createObjectURL(new Blob([data]))
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link) //????????????????????????
      window.URL.revokeObjectURL(url) //?????????blob??????
    }
  })
}

/**
 * ???????????? ???????????????????????????
 * @param url
 * @param parameter
 * @returns {*}
 */
export function uploadAction(url, parameter) {
  return axios({
    url: url,
    data: parameter,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'  // ????????????
    }
  })
}

/**
 * ??????????????????????????????
 * @param avatar
 * @param subStr
 * @returns {*}
 */
export function getFileAccessHttpUrl(avatar, subStr) {
  if (window._CONFIG['BASE_FileType'] == 'mongodb') {
    return window._CONFIG['domianURL'] + `/system/sysFile/opendownload?id=${avatar}`
  }

  if (!subStr) subStr = 'http'
  try {
    if (avatar && avatar.startsWith(subStr)) {
      return avatar
    } else {
      if (avatar && avatar.length > 0 && avatar.indexOf('[') == -1) {
        return window._CONFIG['staticDomainURL'] + '/' + avatar
      }
    }
  } catch (err) {
    return
  }
}
