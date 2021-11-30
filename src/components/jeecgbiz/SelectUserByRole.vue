<template>
  <div>
    <a-input-search></a-input-search>

  </div>
</template>

<script>

export default {
  name: 'JSelectRole',
  components: {  },
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