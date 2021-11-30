<template>
  <a-modal :title="title" :width="modalWidth" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" :cancelText="$t('common.close')">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="$t('header.oldpsd')">
          <a-input type="password" v-decorator="['oldpassword', validatorRules.oldpassword]" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="$t('header.newpsd')">
          <a-input type="password" v-decorator="['password', validatorRules.password]" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="$t('header.confirmpsd')">
          <a-input type="password" @blur="handleConfirmBlur" v-decorator="['confirmpassword', validatorRules.confirmpassword]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { putAction } from '@/api/manage'
import { changePassword } from '@/api/api'
import { Base64 } from 'js-base64'

export default {
  name: 'UserPassword',
  data() {
    return {
      title: this.$t('header.changePassword'),
      modalWidth: 800,
      visible: false,
      confirmLoading: false,
      validatorRules: {
        oldpassword: {
          rules: [
            {
              required: true,
              message: this.$t('header.printOld')
            }
          ]
        },
        password: {
          rules: [
            {
              required: true,
              message: this.$t('header.printNew')
            },
            {
              validator: this.validateToNextPassword
            }
          ]
        },
        confirmpassword: {
          rules: [
            {
              required: true,
              message: this.$t('header.printConfirm')
            },
            {
              validator: this.compareToFirstPassword
            }
          ]
        }
      },
      confirmDirty: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },

      form: this.$form.createForm(this),
      url: 'sys/user/updatePassword',
      username: ''
    }
  },
  created() {},
  methods: {
    show() {
      // if(!uname){
      //   this.$message.warning("当前系统无登录用户!");
      //   return
      // }else{
      // this.username = uname
      this.form.resetFields()
      this.visible = true
      // }
    },
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.disableSubmit = false
      this.selectedRole = []
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          // let params = Object.assign({username:this.username},values)
          changePassword({ oldpassword: Base64.encode(values.oldpassword), password: Base64.encode(values.password) })
            .then(res => {
              if (res.code === 0) {
                that.$message.success(res.msg)
                that.close()
              } else {
                that.$message.warning(res.errors)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
    validateToNextPassword(rule, value, callback) {
      // const form = this.form;
      // if (value && this.confirmDirty) {
      //   form.validateFields(['confirm'], { force: true })
      // }
      // callback();

      let reg = /^[a-zA-Z0-9.!@#$%^&*?]{6,20}$/gi
      let error = value == undefined || value == null || !reg.test(value)
      if (error) {
        callback(new Error(this.$t('header.newPassworderror')))
      } else {
        callback()
      }
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form
      if (value && value !== form.getFieldValue('password')) {
        callback(this.$t('header.psdtip'))
      } else {
        callback()
      }
    },
    handleConfirmBlur(e) {
      const value = e.target.value
      this.confirmDirty = this.confirmDirty || !!value
    }
  }
}
</script>

<style scoped></style>
