<template>
  <j-modal
    centered
    :title="name + $t('order.select')"
    :width='width'
    :visible='visible'
    switchFullscreen
    @ok='handleOk'
    @cancel='close'
    :cancelText="$t('order.cancel')">

    <a-row :gutter='18'>
      <a-col :span='16'>
        <!-- 查询区域 -->
        <a-form layout='inline' class='j-inline-form'>
          <!-- 固定条件 -->
          <a-form-item :label='(queryParamText||name)'>
            <a-input v-model='queryParam[queryParamCode||valueKey]'
                     :placeholder="$t('order.pleaseInput') + (queryParamText||name)"
                     @pressEnter='searchQuery' />
          </a-form-item>
          <!-- 动态生成的查询条件 -->
          <j-select-biz-query-item v-if='queryConfig.length>0' v-show='showMoreQueryItems' :queryParam='queryParam'
                                   :queryConfig='queryConfig' @pressEnter='searchQuery' />
          <!-- 按钮 -->
          <a-button type='primary' @click='searchQuery' icon='search'>{{ $t('common.query') }}</a-button>
          <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>
            {{ $t('common.reset') }}
          </a-button>
          <a v-if='queryConfig.length>0' @click='showMoreQueryItems=!showMoreQueryItems' style='margin-left: 8px'>
            {{ showMoreQueryItems ? $t('order.packUp') : $t('order.packDown') }}
            <a-icon :type="showMoreQueryItems ? 'up' : 'down'" />
          </a>
        </a-form>

        <a-table
          size='middle'
          bordered
          :rowKey='rowKey'
          :columns='innerColumns'
          :dataSource='dataSource'
          :pagination='pageInfo'
          :loading='loading'
          :scroll='{ y: 240 }'
          :rowSelection="{selectedRowKeys, onChange: onSelectChange, type: multiple ? 'checkbox':'radio'}"
          :customRow='customRowFn'
          @change='handleTableChange'>
        </a-table>

      </a-col>
      <a-col :span='8'>
        <a-card :title="$t('order.isSelect') + name" :bordered='false' :head-style='{padding:0}'
                :body-style='{padding:0}'>

          <a-table size='middle' :rowKey='rowKey' bordered v-bind='selectedTable'>
              <span slot='action' slot-scope='text, record, index'>
                <a @click='handleDeleteSelected(record, index)'>{{ $t('common.delete') }}</a>
              </span>
          </a-table>

        </a-card>
      </a-col>
    </a-row>
  </j-modal>
</template>

<script>
import { getAction, postJSON } from '@/api/manage'
import Ellipsis from '@/components/Ellipsis'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { cloneObject, pushIfNotExist } from '@/utils/util'
import JSelectBizQueryItem from './JSelectBizQueryItem'
import moment from 'moment'

export default {
  name: 'JSelectBizComponentModal',
  mixins: [JeecgListMixin],
  components: { Ellipsis, JSelectBizQueryItem },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    },
    valueKey: {
      type: String,
      required: true
    },
    multiple: {
      type: Boolean,
      default: true
    },
    width: {
      type: Number,
      default: 1000
    },

    name: {
      type: String,
      default: ''
    },
    listUrl: {
      type: String,
      required: true,
      default: ''
    },
    // 根据 value 获取显示文本的地址，例如存的是 username，可以通过该地址获取到 realname
    valueUrl: {
      type: String,
      default: ''
    },
    displayKey: {
      type: String,
      default: null
    },
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    // 查询条件Code
    queryParamCode: {
      type: String,
      default: null
    },
    // 查询条件文字
    queryParamText: {
      type: String,
      default: null
    },
    // 查询配置
    queryConfig: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: 'id'
    },
    // 过长裁剪长度，设置为 -1 代表不裁剪
    ellipsisLength: {
      type: Number,
      default: 12
    }
  },
  data() {
    return {
      innerValue: [],
      queryParam: {},
      // 已选择列表
      selectedTable: {
        pagination: false,
        scroll: { y: 240 },
        columns: [
          {
            ...this.columns[0],
            width: this.columns[0].widthRight || this.columns[0].width
          },
          {
            title: this.$t('common.operation'),
            dataIndex: 'action',
            align: 'center',
            width: 60,
            scopedSlots: { customRender: 'action' }
          }
        ],
        dataSource: []
      },
      renderEllipsis: (value) => (<ellipsis length={this.ellipsisLength}>{value}</ellipsis>),
      url: { list: this.listUrl },
      options: [],
      dataSourceMap: {},
      showMoreQueryItems: false
    }
  },
  computed: {
    // 表头
    innerColumns() {
      let columns = cloneObject(this.columns)
      columns.forEach(column => {
        // 给所有的列加上过长裁剪
        if (this.ellipsisLength !== -1) {
          column.customRender = (text) => this.renderEllipsis(text)
        }
      })
      return columns
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val) {
        this.innerValue = cloneObject(val)
        this.selectedRowKeys = []
        this.valueWatchHandler(val)
        this.queryOptionsByValue(val)
      }
    },
    dataSource: {
      deep: true,
      handler(val) {
        this.emitOptions(val)
        this.valueWatchHandler(this.innerValue)
      }
    },
    selectedRowKeys: {
      immediate: true,
      deep: true,
      handler(val) {
        //update--begin--autor:scott-----date:20200927------for：选取职务名称出现全选 #1753-----
        if (this.innerValue) {
          this.innerValue.length = 0
        }
        //update--end--autor:scott-----date:20200927------for：选取职务名称出现全选 #1753-----
        this.selectedTable.dataSource = val.map(key => {
          for (let data of this.dataSource) {
            if (data[this.rowKey] === key) {
              pushIfNotExist(this.innerValue, data[this.valueKey])
              return data
            }
          }
          for (let data of this.selectedTable.dataSource) {
            if (data[this.rowKey] === key) {
              pushIfNotExist(this.innerValue, data[this.valueKey])
              return data
            }
          }
          return {}
        })
      }
    }
  },

  methods: {
    searchReset() {
      this.pageInfo.current = 1
      this.pageInfo.condition = {
        orderByClause: this.orderByClause
      }
      if (this.$store.getters.userInfo.id != '1') {
        this.pageInfo.condition.delFlag = 0
      }
      this.queryParam.id = ''
      this.searchQuery()
    },
    searchQuery() {
      this.loadData(1)
    },
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error(this.$t('order.pleaseSetUrl'))
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.pageInfo.current = 1
      }
      this.loading = true
      this.pageInfo.condition.name = this.queryParam.id
      console.log('param', this.pageInfo)
      postJSON(this.url.list, this.pageInfo).then((res) => {
        if (res.success) {
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.data.list || res.result
          if (res.data.total) {
            this.pageInfo.total = res.data.total
          }
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }
        if (res.code === 500) {
          this.$message.warning(res.errors)
        }
        this.loading = false
      })
    },
    /** 关闭弹窗 */
    close() {
      this.$emit('update:visible', false)
    },

    valueWatchHandler(val) {
      val.forEach(item => {
        this.dataSource.concat(this.selectedTable.dataSource).forEach(data => {
          if (data[this.valueKey] === item) {
            pushIfNotExist(this.selectedRowKeys, data[this.rowKey])
          }
        })
      })
    },

    queryOptionsByValue(value) {
      if (!value || value.length === 0) {
        return
      }
      // 判断options是否存在value，如果已存在数据就不再请求后台了
      let notExist = false
      for (let val of value) {
        let find = false
        for (let option of this.options) {
          if (val === option.value) {
            find = true
            break
          }
        }
        if (!find) {
          notExist = true
          break
        }
      }
      if (!notExist) return
      getAction(this.valueUrl || this.listUrl, {
        // 这里最后加一个 , 的原因是因为无论如何都要使用 in 查询，防止后台进行了模糊匹配，导致查询结果不准确
        [this.valueKey]: value.join(',') + ',',
        pageNo: 1,
        pageSize: value.length
      }).then((res) => {
        if (res.success) {
          let dataSource = res.result
          if (!(dataSource instanceof Array)) {
            dataSource = res.result.records
          }
          this.emitOptions(dataSource, (data) => {
            pushIfNotExist(this.innerValue, data[this.valueKey])
            pushIfNotExist(this.selectedRowKeys, data[this.rowKey])
            pushIfNotExist(this.selectedTable.dataSource, data, this.rowKey)
          })
        }
      })
    },

    emitOptions(dataSource, callback) {
      dataSource.forEach(data => {
        let key = data[this.valueKey]
        this.dataSourceMap[key] = data
        pushIfNotExist(this.options, { label: data[this.displayKey || this.valueKey], value: key }, 'value')
        typeof callback === 'function' ? callback(data) : ''
      })
      this.$emit('options', this.options, this.dataSourceMap)
    },

    /** 完成选择 */
    handleOk() {
      let value = this.selectedTable.dataSource.map(data => data[this.valueKey])
      console.log('value', this.selectedTable.dataSource)
      this.$emit('input', value)
      this.$emit('selectInfo', this.selectedTable.dataSource)
      this.close()
    },
    /** 删除已选择的 */
    handleDeleteSelected(record, index) {
      this.selectedRowKeys.splice(this.selectedRowKeys.indexOf(record[this.rowKey]), 1)
      //update--begin--autor:wangshuai-----date:20200722------for：JSelectBizComponent组件切换页数值问题------
      this.selectedTable.dataSource.splice(this.selectedTable.dataSource.indexOf(record), 1)
      this.innerValue.splice(this.innerValue.indexOf(record[this.valueKey]), 1)
      //update--begin--autor:wangshuai-----date:20200722------for：JSelectBizComponent组件切换页数值问题------
    },

    customRowFn(record) {
      return {
        on: {
          click: () => {
            let key = record[this.rowKey]
            if (!this.multiple) {
              this.selectedRowKeys = [key]
              this.selectedTable.dataSource = [record]
            } else {
              let index = this.selectedRowKeys.indexOf(key)
              if (index === -1) {
                this.selectedRowKeys.push(key)
                this.selectedTable.dataSource.push(record)
              } else {
                this.handleDeleteSelected(record, index)
              }
            }
          }
        }
      }
    }
  },
  created() {
    this.searchQuery()
  }
}
</script>
<style lang='less' scoped>
.full-form-item {
  display: flex;
  margin-right: 0;

  /deep/ .ant-form-item-control-wrapper {
    flex: 1 1;
    display: inline-block;
  }
}

.j-inline-form {
  /deep/ .ant-form-item {
    margin-bottom: 12px;
  }

  /deep/ .ant-form-item-label {
    line-height: 32px;
    width: auto;
  }

  /deep/ .ant-form-item-control {
    height: 32px;
    line-height: 32px;
  }
}
</style>