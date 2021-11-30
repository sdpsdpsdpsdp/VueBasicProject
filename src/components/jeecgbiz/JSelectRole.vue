<template>
  <j-select-biz-component
    :value='value'
    :name="$t('order.role')"
    displayKey='roleName'
    :returnKeys='returnKeys'
    :listUrl='url.list'
    :columns='columns'
    :width='width'
    :queryParamText="$t('order.roleName')"
    v-on='$listeners'
    v-bind='$attrs'
  />
</template>

<script>
import JSelectBizComponent from './JSelectBizComponent'

export default {
  name: 'JSelectRole',
  components: { JSelectBizComponent },
  props: {
    value: {
      type: String,
      default: ""
    },
    width: {
      require:false,
      type: Number,
      default: 1000
    }
  },
  data() {
    return {
      returnKeys: ['name', 'id'],
      url: { list: '/sysRole/listDeptRole' },
      columns: [
        { title: this.$t('order.roleName'), dataIndex: 'name', align: 'center', width: 150 },
        { title: this.$t('order.roleNo'), dataIndex: 'id', align: 'center', width: 150 }
      ]
    }
  }
}
</script>

<style lang='less' scoped></style>