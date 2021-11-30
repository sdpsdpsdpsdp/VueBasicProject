/**
 * 新增修改完成调用 modalFormOk方法 编辑弹框组件ref定义为modalForm
 * 高级查询按钮调用 superQuery方法  高级查询组件ref定义为superQueryModal
 * data中url定义 list为查询列表  delete为删除单条记录  deleteBatch为批量删除
 */
import { filterObj } from '@/utils/util'
import { deleteAction, getAction, downFile, getFileAccessHttpUrl, postJSON } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import store from '@/store'
import { Modal } from 'ant-design-vue'
import moment from 'moment'

export const JeecgListMixin = {
  data() {
    return {
      //token header
      //tokenHeader: {'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)},
      /* 查询条件-请不要在queryParam中声明非字符串值的属性 */
      exportDatas: null, //导出的数据
      exportJsonFiled: {},
      showQueryTime: true,
      queryTimeDefaultValue: [],
      qt: [], //临时保存搜索框的时间
      /* 数据源 */
      dataSource: [],
      /* 分页参数 */
      pageInfo: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          // return range[0] + "-" + range[1] +  this.$t('common.total') + total + this.$t('common.item')
          return this.$t('common.total') + ' ' + total + ' ' + this.$t('common.item')
        },
        condition: {
          orderByClause: 'level asc , sort_no desc' || 'create_time desc'
        }, //搜索条件
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      /* 排序参数 */
      isorter: {
        column: 'createTime',
        order: 'desc'
      },
      /* 筛选参数 */
      filters: {},
      /* table加载状态 */
      loading: false,
      /* table选中keys*/
      selectedRowKeys: [],
      /* table选中records*/
      selectionRows: [],
      /* 查询折叠 */
      toggleSearchStatus: false,
      /* 高级查询条件生效状态 */
      superQueryFlag: false,
      /* 高级查询条件 */
      superQueryParams: '',
      /** 高级查询拼接方式 */
      superQueryMatchType: 'and',
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return this.$t('common.total') + ' ' + total + ' ' + this.$t('common.item')
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      }
    }
  },
  computed: {
    scroll: function() {
      var width = window.innerWidth
      let $antTable = window.document.getElementsByClassName('ant-row')
      if ($antTable[0]) {
        width = $antTable[0].clientWidth
      }
      console.log('$antTable', $antTable)
      return {
        // x:'max-content',
        x: width,
        y: window.innerHeight / 2
      }
    },
    innerHeight: function() {
      var innerHeight = window.innerHeight
      return innerHeight
    }
  },
  methods: {
    moment,
    getOrderTypeName(type) {
      if (type === 1) {
        return this.$t('order.batchInstall')
      } else if (type === 2) {
        return this.$t('order.singleInstall')
      } else if (type === 3) {
        return this.$t('order.cancelAccount')
      } else if (type === 4) {
        return this.$t('order.refund')
      } else if (type === 5) {
        return this.$t('order.repair')
      } else if (type === 6) {
        return this.$t('order.replaceMeter')
      }
      return this.$t('order.unknown')
    },
    getPriorityName(priority) {
      if (priority === 1) {
        return this.$t('order.form.level_low')
      } else if (priority === 2) {
        return this.$t('order.form.level_normal')
      } else if (priority === 3) {
        return this.$t('order.form.level_high')
      } else if (priority === 4) {
        return this.$t('order.form.level_urgency')
      }
      return this.$t('order.unknown')
    },
    initDictConfig() {
      console.log('--这是一个假的方法!')
    },
    handleSuperQuery(params, matchType) {
      this.loadData()
    },

    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectionRows
    },
    onClearSelected() {
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    searchReset() {
      this.customerName = null //退购记录搜索
      this.pageInfo.current = 1
      this.pageInfo.condition = {
        orderByClause: this.orderByClause
      }
      if (this.$store.getters.userInfo.id != '1') {
        this.pageInfo.condition.delFlag = 0
      }
      //初始化查询条件的时间范围
      this.pageInfo.condition.startTime = this.moment()
        .add(-3, 'M')
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss')
      this.pageInfo.condition.endTime = this.moment()
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss')
      this.queryTimeDefaultValue[0] = moment(this.pageInfo.condition.startTime, 'YYYY-MM-DD')
      this.queryTimeDefaultValue[1] = moment(this.pageInfo.condition.endTime, 'YYYY-MM-DD')
      this.$set(this.qt, 0, moment(this.pageInfo.condition.startTime, 'YYYY-MM-DD'))
      this.$set(this.qt, 1, moment(this.pageInfo.condition.endTime, 'YYYY-MM-DD'))
      this.loadData()
    },
    searchQuery() {
      this.pageInfo.current = 1
      this.loadData()
    },
    batchDel: function() {},
    handleDelete: function(id) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      deleteAction(`${that.url.delete}/${id}`).then(res => {
        if (res.code === 0) {
          that.$message.success(res.msg)
          that.loadData()
        } else {
          that.$message.warning(res.errors)
        }
      })
    },
    handleEdit: function(record) {
      console.log(record, '--line154')
      this.$refs.modalForm.edit(record)
      this.$refs.modalForm.title = this.$t('common.edit')
      this.$refs.modalForm.disableSubmit = false
    },
    handleAdd: function() {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = this.$t('form.add')
      this.$refs.modalForm.disableSubmit = false
    },
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      if (sorter && sorter.field == 'debt') {
        if (sorter.order == 'ascend') {
          //升序
          this.pageInfo.condition.orderByClause = 'debt desc'
        } else {
          this.pageInfo.condition.orderByClause = 'debt asc'
        }
      }
      this.pageInfo = pagination
      this.loadData()
    },
    handleToggleSearch() {
      this.toggleSearchStatus = !this.toggleSearchStatus
    },
    // 给popup查询使用(查询区域不支持回填多个字段，限制只返回一个字段)
    getPopupField(fields) {
      return fields.split(',')[0]
    },
    modalFormOk(re) {
      // 新增/修改 成功时，重载列表
      if (re && re.parentId) {
        this.expandedRowKeys.push(re.parentId)
      }
      this.loadData()
    },
    handleDetail: function(record) {
      this.$refs.modalForm.detail(record)
      this.$refs.modalForm.title = this.$t('common.detail')
      this.$refs.modalForm.disableSubmit = true
    },
    /* 导出 */
    handleExportXls2() {
      let paramsStr = encodeURI(JSON.stringify(this.getQueryParams()))
      let url = `${window._CONFIG['domianURL']}/${this.url.exportXlsUrl}?paramsStr=${paramsStr}`
      window.location.href = url
    },
    handleExportXls(fileName) {
      if (!fileName || typeof fileName != 'string') {
        fileName = '导出文件'
      }
      let param = this.getQueryParams()
      if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
        param['selections'] = this.selectedRowKeys.join(',')
      }
      console.log('导出参数', param)
      downFile(this.url.exportXlsUrl, param).then(data => {
        if (!data) {
          this.$message.warning('文件下载失败')
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName + '.xls')
        } else {
          let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link) //下载完成移除元素
          window.URL.revokeObjectURL(url) //释放掉blob对象
        }
      })
    },
    queryTimeChange(dates, vv) {
      if (!dates[0]) {
        dates[0] = this.moment()
          .add(-3, 'M')
          .startOf('day') //开始时间是当前时间减去3个月
      }
      if (!dates[1]) {
        dates[1] = this.moment().endOf('day') //结束时间是当天
      }
      dates[0].locale('en_US')
      dates[1].locale('en_US')
      this.pageInfo.condition.startTime = dates[0].startOf('day').format('YYYY-MM-DD HH:mm:ss')
      this.pageInfo.condition.endTime = dates[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')
    },
    /* 导入 */
    handleImportExcel(info) {},
    /* 图片预览 */
    getImgView(text) {
      if (text && text.indexOf(',') > 0) {
        text = text.substring(0, text.indexOf(','))
      }
      return getFileAccessHttpUrl(text)
    },
    /* 文件下载 */
    // update--autor:lvdandan-----date:20200630------for：修改下载文件方法名uploadFile改为downloadFile------
    downloadFile(text) {
      if (!text) {
        this.$message.warning('未知的文件')
        return
      }
      if (text.indexOf(',') > 0) {
        text = text.substring(0, text.indexOf(','))
      }
      let url = getFileAccessHttpUrl(text)
      window.open(url)
    }
  }
}
