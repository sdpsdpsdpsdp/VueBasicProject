<template>
  <div class="main">
    <a-form :form="form" class="user-layout-login" ref="formLogin" id="formLogin">
      <a-form-item>
        <a-input size="large" v-decorator="['username', validatorRules.username, { validator: this.handleUsernameOrEmail }]" type="text" :placeholder="$t('login.userName')">
          <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input v-decorator="['password', validatorRules.password]" size="large" type="password" autocomplete="false" :placeholder="$t('login.password')">
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>
      <!--<a-form-item>-->
      <!--<a-checkbox v-decorator="['rememberMe', {initialValue: true, valuePropName: 'checked'}]" >自动登录</a-checkbox>-->
      <!--<router-link :to="{ name: 'alteration'}" class="forge-password" style="float: right;">-->
      <!--忘记密码-->
      <!--</router-link>-->
      <!--</a-form-item>-->

      <a-form-item style="margin-top:24px">
        <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="loginBtn" @click.stop.prevent="handleSubmit" :disabled="loginBtn">{{ $t('common.confirm') }} </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { Base64 } from 'js-base64'
import { login } from '@/api/login'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import Vue from 'vue'
import { ACCESS_TOKEN, ENCRYPTED_STRING } from '@/store/mutation-types'
import { putAction, postAction, getAction } from '@/api/manage'
import { encryption, getEncryptedString } from '@/utils/encryption/aesEncrypt'
import store from '@/store/'
import { USER_INFO } from '@/store/mutation-types'
import { queryPermissionsByUser } from '@/api/api'

export default {
  components: {},
  data() {
    return {
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      encryptedString: {
        key: '',
        iv: ''
      },
      state: {
        time: 60,
        smsSendBtn: false
      },
      validatorRules: {
        username: { rules: [{ required: true, message: '请输入用户名!' }, { validator: this.handleUsernameOrEmail }] },
        password: { rules: [{ required: true, message: '请输入密码!', validator: 'click' }] },
        mobile: { rules: [{ validator: this.validateMobile }] },
        captcha: { rule: [{ required: true, message: '请输入验证码!' }] },
        inputCode: { rules: [{ required: true, message: '请输入验证码!' }] }
      },
      verifiedCode: '',
      inputCodeContent: '',
      inputCodeNull: true,
      currentUsername: '',
      currdatetime: '',
      randCodeImage: '',
      requestCodeSuccess: false
    }
  },
  created() {
    this.currdatetime = new Date().getTime()
    Vue.ls.remove(ACCESS_TOKEN)
    // this.getRouterData();
    //this.handleChangeCheckCode();
    // update-begin- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
    //this.getEncrypte();
    // update-end- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
  },
  methods: {
    ...mapActions(['Login', 'Logout', 'PhoneLogin']),
    // handler
    handleUsernameOrEmail(rule, value, callback) {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        this.loginType = 0
      } else {
        this.loginType = 1
      }
      callback()
    },
    handleTabClick(key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
    handleSubmit() {
      let that = this
      // let loginParams = {};
      that.loginBtn = true
      // 使用账户密码登录
      that.form.validateFields(['username', 'password'], { force: true }, (err, values) => {
        if (!err) {
          let p = {}
          p.username = values.username
          let pass = Base64.encode(values.password)
          p.password = pass
          p.grant_type = 'password'
          p.client_id = 'system'
          p.client_secret = 'system'
          p.scope = 'app'
          login(p).then(res => {
            console.log(res)
            if (res.access_token) {
              Vue.ls.set(ACCESS_TOKEN, res.access_token, 7 * 24 * 60 * 60 * 1000)
              // Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
              // Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
              // Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
              this.$store.commit('SET_TOKEN', res.access_token)
              // commit('SET_INFO', userInfo)
              // commit('SET_NAME', { username: userInfo.username,realname: userInfo.realname, welcome: welcome() })
              // commit('SET_AVATAR', userInfo.avatar)

              this.loginSuccess()
            } else {
              let description = res.errors
              if (res.code == 407) {
                //禁止登陆
                description = this.$t('login.forbidLogin')
              } else if (res.code == 406) {
                //用户名错误
                description = this.$t('login.usernameerror')
              } else if (res.code == 405) {
                //密码错误
                description = this.$t('login.passworderror')
              }
              this.$notification['error']({
                message: this.$t('login.failed'),
                description: description,
                duration: 4
              })
              this.loginBtn = false
            }
          })

          // let loginParams = `username=${values.username}&password='+pass+'&grant_type=password&client_id=system&client_secret=system&scope=app`
          //
          // that.Login(loginParams).then((res) => {
          //   this.loginSuccess()
          // }).catch((err) => {
          //   that.requestFailed(err);
          // });
        } else {
          that.loginBtn = false
        }
      })
    },
    stepCaptchaSuccess() {
      this.loginSuccess()
    },
    stepCaptchaCancel() {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    handleChangeCheckCode() {
      this.currdatetime = new Date().getTime()
      getAction(`/sys/randomImage/${this.currdatetime}`)
        .then(res => {
          if (res.success) {
            this.randCodeImage = res.result
            this.requestCodeSuccess = true
          } else {
            this.$message.error(res.message)
            this.requestCodeSuccess = false
          }
        })
        .catch(() => {
          this.requestCodeSuccess = false
        })
    },
    async loginSuccess() {
      let res = await queryPermissionsByUser()
      window.vvv._i18n.locale = res.data.language
      this.$router.push({ path: '/' }).catch((e, e2) => {
        console.log(e, e2, 999)
        console.log('登录跳转首页出错,这个错误从哪里来的')
      })
      this.$notification.success({
        message: this.$t('common.welcome'),
        description: this.$t('common.welcomeBack') + ' :' + res.data.realname
      })
    },
    cmsFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: err,
        duration: 4
      })
    },
    requestFailed(err) {
      console.log(err, 'login.vue')
      this.$notification['error']({
        message: '登录失败',
        description: ((err.response || {}).data || {}).errors || err.errors || '请求出现错误，请稍后再试',
        duration: 4
      })
      this.loginBtn = false
    },
    generateCode(value) {
      this.verifiedCode = value.toLowerCase()
    },
    inputCodeChange(e) {
      this.inputCodeContent = e.target.value
    },
    loginSelectOk() {
      this.loginSuccess()
    },
    getRouterData() {
      this.$nextTick(() => {
        if (this.$route.params.username) {
          this.form.setFieldsValue({
            username: this.$route.params.username
          })
        }
      })
    },
    //获取密码加密规则
    getEncrypte() {
      var encryptedString = Vue.ls.get(ENCRYPTED_STRING)
      if (encryptedString == null) {
        getEncryptedString().then(data => {
          this.encryptedString = data
        })
      } else {
        this.encryptedString = encryptedString
      }
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>
<style>
.valid-error .ant-select-selection__placeholder {
  color: #f5222d;
}
</style>
