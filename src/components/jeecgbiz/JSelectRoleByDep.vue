<template>
  <div class='components-input-demo-presuffix'>
    <a-input @click='openModal' :placeholder='placeTitle' v-model='roleNames' readOnly :disabled='disabled'>
      <a-icon slot='prefix' type='team' :title="$t('order.deptControl')" />
      <a-icon v-if='roleNames' slot='suffix' type='close-circle' @click='handleEmpty' :title="$t('order.clear')" />
    </a-input>
    <j-modal
      :width='modalWidth'
      :visible='visible'
      :title='title'
      switchFullscreen
      @ok='handleSubmit'
      @cancel='close'
      style='top:50px'
      :cancelText="$t('order.close')"
    >
      <a-row :gutter='10' style='background-color: #ececec; padding: 10px; margin: -10px'>
        <a-col :md='8' :sm='24'>
          <a-card :bordered='false'>
            <!--组织机构-->
            <a-directory-tree
              selectable
              :selectedKeys='selectedDepIds'
              :checkStrictly='true'
              :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
              :treeData='departTree'
              :expandedKeys.sync='expandedKeys'
              @expand='onExpandedChange'
              @select='onDepSelect'
            />
          </a-card>
        </a-col>
        <a-col :md='16' :sm='24'>
          <a-card :bordered='false'>
            {{ $t('order.roleName') }}:
            <a-input-search
              :style="{width:'150px',marginBottom:'15px'}"
              :placeholder="$t('order.pleaseInputRoleName')"
              v-model='queryParam.roleName'
              @search='onSearch'
            ></a-input-search>
            <a-button @click='searchReset(1)' style='margin-left: 20px' icon='redo'> {{ $t('order.reset') }}</a-button>
            <!--用户列表-->
            <a-table
              ref='table'
              :scroll='scrollTrigger'
              size='middle'
              rowKey='id'
              :columns='columns'
              :dataSource='dataSource'
              :pagination='ipagination'
              :rowSelection='{selectedRowKeys: selectedRowKeys, onChange: onSelectChange,type: getType}'
              :loading='loading'
              @change='handleTableChange'>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </j-modal>
  </div>
</template>

<script>
import JSelectUserByDepModal from './modal/JSelectUserByDepModal'
import { queryDeptTreeList } from '@api/api'
import { postJSON, postAction } from '@api/manage'

export default {
  name: 'JSelectRoleByDep',
  components: { JSelectUserByDepModal },
  props: {
    modalWidth: {
      type: Number,
      default: 1250,
      required: false
    },
    roleIds: {
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    multi: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  data() {
    return {
      roleNames: '',
      loading: false,
      visible: false,
      scrollTrigger: {},
      placeTitle: this.$t('order.selectRole'),
      selectedDepIds: [],
      departTree: [],
      expandedKeys: [],
      selectedRowKeys: [],
      selectRoles: [],
      dataSource: [],
      queryParam: {
        roleName: '',
        deptId: ''
      },
      curSelectDeptId: '',
      columns: [
        {
          title: this.$t('order.roleName'),
          align: 'center',
          dataIndex: 'name',
          width: 150
        },
        {
          title: this.$t('order.status'),
          align: 'center',
          dataIndex: 'state',
          width: 150,
          customRender: (text) => {
            if (text === 1) {
              return this.$t('common.enable')
            } else {
              return this.$t('common.disable')
            }
          }
        },
        {
          title: this.$t('order.createBy'),
          align: 'center',
          dataIndex: 'creator',
          width: 150
        },
        {
          title: this.$t('order.dept'),
          align: 'center',
          dataIndex: 'deptName',
          width: 150
        }
      ],
      url: {
        selectRolesByDept: '/sysRole/selectRolesByDept',
        selectRolesByIds: '/sysRole/selectRolesByIds'
      },
      title: this.$t('order.selectRoleFromDept'),
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + this.$t('order.total') + total + this.$t('order.count')
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      }
    }
  },
  computed: {
    getType: function() {
      return this.multi == true ? 'checkbox' : 'radio'
    }
  },
  watch: {
    roleIds(newData, oldData) {
      this.buildEchoData()
    }
  },
  mounted() {
    this.buildEchoData()
  },
  created() {// 该方法触发屏幕自适应
    this.resetScreenSize()
  },
  methods: {
    onExpandedChange(expandedKeys) {

    },
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectionRows
      this.checkAndPushRoles()
    },
    checkAndPushRoles() {
      if (this.selectionRows && this.selectionRows.length > 0) {
        for (let i = 0; i < this.selectionRows.length; i++) {
          if (!this.hasContainRoleId(this.selectionRows[i].id)) {
            this.selectRoles.push(this.selectionRows[i])
          }
        }
      }
      if (!this.selectedRowKeys || this.selectedRowKeys.length < 1) {
        this.selectRoles = []
      } else {
        let result = []
        for (let i = 0; i < this.selectedRowKeys.length; i++) {
          let role = this.getRole(this.selectedRowKeys[i])
          if (role != null) {
            result.push(role)
          }
        }
        this.selectRoles = result
      }
    },
    hasContainRoleId(roleId) {
      if (!roleId || roleId.length < 1) return true
      if (this.selectRoles.length < 1) {
        return false
      }
      for (let i = 0; i < this.selectRoles.length; i++) {
        if (this.selectRoles[i].id === roleId) {
          return true
        }
      }
      return false
    },
    getRole(roleId) {
      if (!roleId || roleId.length < 1) return null
      if (this.selectRoles.length < 1) {
        return null
      }
      for (let i = 0; i < this.selectRoles.length; i++) {
        if (this.selectRoles[i].id === roleId) {
          return this.selectRoles[i]
        }
      }
      return null
    },
    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = 'ascend' === sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      this.onSearch()
    },
    searchReset(num) {
      let that = this
      if (num !== 0) {
        that.queryParam = {}
        this.onSearch()
      }
      that.selectedRowKeys = []
      that.selectUserIds = []
      that.selectedDepIds = []
    },
    onSearch() {
      this.queryParam.pageInfo = this.ipagination
      if (!this.queryParam.deptId || this.queryParam.deptId === '') {
        this.loading = false
        this.$message.warning(this.$t('order.pleaseSelectDept'))
        return
      }
      postJSON(this.url.selectRolesByDept, this.queryParam).then(res => {
        this.loading = false
        this.dataSource = res.data.list
      }).catch(err => {
        this.loading = false
      })
    },
    // 点击树节点,筛选出对应的角色
    onDepSelect(selectedDepIds) {
      this.queryParam.deptId = ''
      if (selectedDepIds && selectedDepIds.length > 0) {
        this.queryParam.deptId = selectedDepIds[0]
        this.onSearch()
      }
    },
    //确定选择了 role 信息
    handleSubmit() {
      let roleNames = ''
      if (this.selectRoles && this.selectRoles.length > 0) {
        for (let i = 0; i < this.selectRoles.length; i++) {
          roleNames += this.selectRoles[i].name
          if (i < this.selectRoles.length - 1) {
            roleNames += ','
          }
        }
        this.roleNames = roleNames
        this.$emit('onRoleSelect', this.selectRoles)
        this.close()
      }
    },
    async buildEchoData() {
      let roleIds = ''
      let roleNames = ''
      this.selectedDepIds = []
      this.expandedKeys = []
      this.selectionRows = []
      this.selectedRowKeys = []
      this.roleNames = ''
      this.selectRoles=[]
      if (this.roleIds && this.roleIds.length > 0) {
        roleIds = this.roleIds.split(',')
        if (roleIds) {
          let res = await postJSON(this.url.selectRolesByIds, roleIds)
          let roleInfos = res.data
          if (roleInfos && roleInfos.length > 0) {
            this.expandedKeys = []
            for (let i = 0; i < roleInfos.length; i++) {
              roleNames += roleInfos[i].name
              if (i < roleInfos.length - 1) {
                roleNames += ','
              }
              this.expandedKeys.push(roleInfos[i].deptId)
              this.selectRoles.push(roleInfos[i])
            }
            this.selectedDepIds = this.expandedKeys
            this.selectedRowKeys = roleIds
          }
          this.selectionRows = roleInfos
        }
      }
      this.roleNames = roleNames
      this.queryDepartTree()
    },
    handleEmpty() {
      this.selectionRows = []
      this.selectedRowKeys = []
      this.roleNames = ''
      this.selectRoles=[]
      this.$emit('onClearRole')
    },
    close() {
      this.visible = false
    },
    openModal() {
      this.visible = true
    },
    // 触发屏幕自适应
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.scrollTrigger = { x: 800 }
      } else {
        this.scrollTrigger = {}
      }
    },
    //获取部门树
    queryDepartTree() {
      this.loading = true
      queryDeptTreeList().then((res) => {
        if (res.success) { // 默认展开父节点
          this.departTree = res.data
          if (!this.expandedKeys) {
            this.expandedKeys = this.departTree.map(item => item.id)
          }
          if (this.departTree && this.departTree.length > 0) {
            if (!this.selectedDepIds || this.selectedDepIds.length < 1) {
              this.queryParam.deptId = this.departTree[0].id
            } else {
              this.queryParam.deptId = this.selectedDepIds[0]
            }
            this.onSearch()
          } else {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>