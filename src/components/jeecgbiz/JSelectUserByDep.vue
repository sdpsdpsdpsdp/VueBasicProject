<template>
  <div>
    <!--    <a-input-search-->
    <!--        v-model='usernames'-->
    <!--        placeholder='请先选择用户'-->
    <!--        readOnly-->
    <!--        unselectable='on'-->
    <!--        @search='onSearchDepUser'>-->
    <!--      <a-button slot='enterButton' :disabled='disabled'>选择用户</a-button>-->
    <!--    </a-input-search>-->
    <div style='display: flex'>
      <a-select
          mode='multiple'
          style='width: 100%'
          :placeholder="$t('order.selectPerson')"
          option-label-prop='label'
          v-model='selectIds'
          @change='onDataChange'
      >
        <a-select-option v-for='item in selectUsers' :value='item.id' :key='item.id' :label='item.realname'>
          {{ item.realname }}
        </a-select-option>
      </a-select>
      <a-button @click='onSearchDepUser' :disabled='disabled'>{{$t('order.selectPerson')}}</a-button>
    </div>


    <j-select-user-by-dep-modal ref='selectModal' :modal-width='modalWidth' :multi='multi' @ok='selectOK'
                                :user-ids='selectIdStr' />
  </div>
</template>

<script>
import JSelectUserByDepModal from './modal/JSelectUserByDepModal'

export default {
  name: 'JSelectUserByDep',
  components: { JSelectUserByDepModal },
  props: {
    modalWidth: {
      type: Number,
      default: 1250,
      required: false
    },
    users: {
      type: Array,
      required: false
    },
    value: {
      type: Array,
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
      selectUsers: [],
      selectIds: [],
      selectIdStr: ''
    }
  },
  watch: {
    users: {
      handler(newVal, oldVal) {
        this.resetUserData(newVal)
      }
    }
  },
  mounted() {
    this.resetUserData(this.users)
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  methods: {
    onSearchDepUser() {
      this.$refs.selectModal.showModal()
    },
    selectOK(rows, idstr) {
      this.resetUserData(rows)
      this.$emit('change', this.selectUsers)
    },
    resetUserData(val) {
      this.selectUsers = val
      this.selectIds = []
      this.selectIdStr = ''
      if (this.selectUsers != undefined && this.selectUsers.length > 0) {
        for (let i = 0; i < this.selectUsers.length; i++) {
          this.selectIds.push(this.selectUsers[i].id)
          this.selectIdStr += this.selectUsers[i].id + ','
        }
      }
      this.selectIdStr = this.removeLastChar(this.selectIdStr)
    },
    onDataChange(val) {
      this.buildUsersInfo(val)
      this.$emit('change', this.selectUsers)
    },
    buildUsersInfo(selIds) {
      if (selIds == undefined || selIds.length < 1) {
        this.selectUsers = []
        this.selectIds = []
        this.selectIdStr = ''
      } else {
        let selUsers = []
        this.selectIdStr = ''
        for (let i = 0; i < selIds.length; i++) {
          let user = this.findUserById(selIds[i])
          if (user != null) {
            selUsers.push(user)
            this.selectIdStr += selIds[i] + ','
          }
        }
        this.selectUsers = selUsers
        this.selectIds = selIds
        this.selectIdStr = this.removeLastChar(this.selectIdStr)
      }
    },
    findUserById(userId) {
      if (userId == undefined || this.selectUsers == undefined || this.selectUsers.length < 1) {
        return null
      }
      for (let i = 0; i < this.selectUsers.length; i++) {
        if (userId === this.selectUsers[i].id) {
          return this.selectUsers[i]
        }
      }
      return null
    },
    removeLastChar(str) {
      if (str != undefined && str.endsWith(',')) {
        return str.substring(0, str.length - 1)
      }
      return str
    }
  }
}
</script>

<style scoped>

</style>