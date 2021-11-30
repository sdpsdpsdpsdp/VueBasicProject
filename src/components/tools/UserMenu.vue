<template>
  <div class="user-wrapper" :class="theme">
    <!-- update_begin author:zhaoxin date:20191129 for: 做头部菜单栏导航 -->
    <!-- update-begin author:sunjianlei date:20191@20 for: 解决全局样式冲突的问题 -->
    <!-- <span class="action" @click="showClick">
      <a-icon type="search"></a-icon>
    </span> -->
    <!-- update-begin author:sunjianlei date:20200219 for: 菜单搜索改为动态组件，在手机端呈现出弹出框 -->
    <!-- <component :is="searchMenuComp" v-show="searchMenuVisible || isMobile()" class="borders" :visible="searchMenuVisible" :title="$t('common.menuTitle')" :footer="null" @cancel="searchMenuVisible=false">
      <a-select
        class="search-input"
        showSearch
        :showArrow="false"
        :placeholder="$t('common.menuTitle')"
        optionFilterProp="children"
        :filterOption="filterOption"
        :open="isMobile()?true:null"
        :getPopupContainer="(node) => node.parentNode"
        :style="isMobile()?{width: '100%',marginBottom:'50px'}:{}"
        @change="searchMethods"
        @blur="hiddenClick"
      >
        <a-select-option v-for="(site,index) in searchMenuOptions" :key="index" :value="site.id">{{site.title}}</a-select-option>
      </a-select>
    </component> -->
    <!-- update-end author:sunjianlei date:20200219 for: 菜单搜索改为动态组件，在手机端呈现出弹出框 -->
    <!-- update-end author:sunjianlei date:20191220 for: 解决全局样式冲突的问题 -->
    <!-- update_end  author:zhaoxin date:20191129 for: 做头部菜单栏导航 -->
    <!-- <span class="action">
      <a class="logout_title" target="_blank" href="http://doc.jeecg.com">
        <a-icon type="question-circle-o"></a-icon>
      </a>
    </span> -->
     <header-notice class="action" v-if= "hasPermission('message')"/>
    <a-dropdown>
      <span class="action action-full ant-dropdown-link user-dropdown-menu">
         <!--<a-avatar class="avatar" size="small" :src="getAvatar()"/> -->
        <span v-if="isDesktop()">{{$t('common.welcome')}},{{userName}}</span>
      </span>
      <a-menu slot="overlay" class="user-dropdown-menu-wrapper">
        <a-menu-item key="0" v-if="showMenuItem('AccountCenter')">
          <router-link :to="{ name: 'AccountCenter' }">
            <a-icon type="user"/>
            <span>{{$t('header.list1')}}</span>
          </router-link>
        </a-menu-item>
        <!--<a-menu-item key="1">-->
          <!--<router-link :to="{ name: 'AccountSettingsBase' }">-->
            <!--<a-icon type="setting"/>-->
            <!--<span>账户设置</span>-->
          <!--</router-link>-->
        <!--</a-menu-item>-->
        <a-menu-item key="3"  @click="systemSetting">
           <a-icon type="tool"/>
           <span>{{$t('header.list2')}}</span>
        </a-menu-item>
        <a-menu-item key="4" @click="updatePassword">
          <a-icon type="setting"/>
          <span>{{$t('header.list3')}}</span>
        </a-menu-item>
        <a-menu-item key="2">
          <a href="javascript:;" @click="handleLogout">
            <a-icon type="logout"/>
            <span>{{$t('header.list4')}}</span>
          </a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
    <a-select :default-value="defaultLang" style="width: 120px" @change="handleChangeLang">
      <a-select-option value="ar_EG" v-if="showLan('ar_EG')">
        عربي ، 
      </a-select-option>
      <a-select-option value="en_US" v-if="showLan('en_US')">
        English
      </a-select-option>
       <a-select-option value="zh_CN" v-if="showLan('zh_CN')">
        中文
      </a-select-option> 
      
    </a-select>
    <user-password ref="userPassword"></user-password>
    <depart-select ref="departSelect" :closable="false" title="部门切换"></depart-select>
    <setting-drawer ref="settingDrawer" :closable="true" title="系统设置"></setting-drawer>
  </div>
</template>

<script>
  import HeaderNotice from './HeaderNotice'
  import UserPassword from './UserPassword'
  import SettingDrawer from "@/components/setting/SettingDrawer";
  import DepartSelect from './DepartSelect'
  import { mapActions, mapGetters,mapState } from 'vuex'
  import { mixinDevice } from '@/utils/mixin.js'
  import { getFileAccessHttpUrl,getAction } from "@/api/manage"
  import Vue from 'vue'
  import { UI_CACHE_DB_DICT_DATA } from "@/store/mutation-types"
  import { changeLanguage } from "@/api/api"


  import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN'
  import en_US from 'ant-design-vue/lib/locale-provider/en_US'
  import ar_EG from 'ant-design-vue/lib/locale-provider/ar_EG'
  import moment from 'moment';
  import 'moment/locale/zh-cn';
  import 'moment/locale/ar';
  moment.locale('en');

  export default {
    inject:['reload'],
    name: "UserMenu",
    mixins: [mixinDevice],

    data(){
      return{
        isShowNotice:false,
        // update-begin author:sunjianlei date:20200219 for: 头部菜单搜索规范命名 --------------
        searchMenuOptions:[],
        searchMenuComp: 'span',
        searchMenuVisible: false,
        defaultLang:localStorage.getItem('language') || "en_US",
        userName:JSON.parse(sessionStorage.getItem('LOGIN_USER_BUTTON_AUTH'))
        // update-begin author:sunjianlei date:20200219 for: 头部菜单搜索规范命名 --------------
      }
    },
    components: {
      HeaderNotice,
      UserPassword,
      DepartSelect,
      SettingDrawer
    },
    props: {
      theme: {
        type: String,
        required: false,
        default: 'dark'
      }
    },
    /* update_begin author:zhaoxin date:20191129 for: 做头部菜单栏导航*/
    created() {
      let lists = []
      this.searchMenus(lists,this.permissionMenuList)
      this.searchMenuOptions=[...lists]
    },
    mounted() {
      //如果是单点登录模式
      if (process.env.VUE_APP_SSO == 'true') {
        let depart = this.userInfo().orgCode
        if (!depart) {
          this.updateCurrentDepart()
        }
      }
    },
    computed: {
      ...mapState({
        // 后台菜单
        permissionMenuList: state => state.user.permissionList
      })
    },
    /* update_end author:zhaoxin date:20191129 for: 做头部菜单栏导航*/
    watch: {
      // update-begin author:sunjianlei date:20200219 for: 菜单搜索改为动态组件，在手机端呈现出弹出框
      device: {
        immediate: true,
        handler() {
          this.searchMenuVisible = false
          this.searchMenuComp = this.isMobile() ? 'a-modal' : 'span'
        },
      },
      // update-end author:sunjianlei date:20200219 for: 菜单搜索改为动态组件，在手机端呈现出弹出框
    },
    methods: {
      ...mapGetters(["local"]),
      /* update_begin author:zhaoxin date:20191129 for: 做头部菜单栏导航*/
      showClick() {
        this.searchMenuVisible = true
      },
      hiddenClick(){
        this.shows = false
      },
      showLan(lan){
          return  this.$store.getters.userInfo.sysDept.config.languageList.includes(lan)
      },
      handleChangeLang(value){
        changeLanguage({language:value}).then(res => {
          console.log(res);
          this.$i18n.locale = value;
          if(value === "zh_CN"){
            this.$store.dispatch('editLocal', zh_CN);
            moment.locale('zh-cn');
          }else if(value === "en_US"){
            this.$store.dispatch('editLocal', en_US);
            moment.locale('en');
          }else if(value === "ar_EG"){
            this.$store.dispatch('editLocal', ar_EG);
            moment.locale('ar');
          }
          window.localStorage.setItem('language',value);
          // this.reload()
          location.reload();
        })
      },
      /* update_end author:zhaoxin date:20191129 for: 做头部菜单栏导航*/
      ...mapActions(["Logout"]),
      // ...mapGetters(["nickname", "avatar","userInfo"]),
      getAvatar(){
        return getFileAccessHttpUrl(this.avatar())
      },

      handleLogout() {
        const that = this

        this.$confirm({
          title: this.$t('common.hint'),
          content: this.$t('login.islogout'),
          onOk() {
            return that.Logout({}).then(() => {
              // that.$router.push({ path: '/user/login' });
              // window.location.reload()
            }).catch(err => {
              that.$message.error({
                title: this.$t('login.title'),
                description: err.errors
              })
            })
          },
          onCancel() {
          },
        });
      },
      updatePassword(){
        // let username = this.userInfo().username
        // this.$refs.userPassword.show(username)
        this.$refs.userPassword.show()
      },
      updateCurrentDepart(){
        this.$refs.departSelect.show()
      },
      systemSetting(){
        this.$refs.settingDrawer.showDrawer()
      },
      /* update_begin author:zhaoxin date:20191129 for: 做头部菜单栏导航*/
      searchMenus(arr,menus){
        for(let i of menus){
          if(!i.hidden && "layouts/RouteView"!==i.component){
           arr.push(i)
          }
          if(i.children&& i.children.length>0){
            this.searchMenus(arr,i.children)
          }
        }
      },
      filterOption(input, option) {
        return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      },
      // update_begin author:sunjianlei date:20191230 for: 解决外部链接打开失败的问题
      searchMethods(value) {
        let route = this.searchMenuOptions.filter(item => item.id === value)[0]
        // if (route.component.includes('layouts/IframePageView')) {
        //   window.open(route.meta.url, '_blank')
        // } else {
          this.$router.push({ path: route.url })
        // }
        this.searchMenuVisible = false
      },
      // update_end author:sunjianlei date:20191230 for: 解决外部链接打开失败的问题
      /*update_end author:zhaoxin date:20191129 for: 做头部菜单栏导航*/
      /*update_begin author:liushaoqian date:20200507 for: 刷新缓存*/
      clearCache(){
        getAction("sys/dict/refleshCache").then((res) => {
          if (res.success) {
            //重新加载缓存
            getAction("sys/dict/queryAllDictItems").then((res) => {
              if (res.success) {
                Vue.ls.remove(UI_CACHE_DB_DICT_DATA)
                Vue.ls.set(UI_CACHE_DB_DICT_DATA, res.result, 7 * 24 * 60 * 60 * 1000)
              }
            })
            this.$message.success("刷新缓存完成！");
          }
        }).catch(e=>{
          this.$message.warn("刷新缓存失败！");
          console.log("刷新失败",e)
        })
      },
      /*update_end author:liushaoqian date:20200507 for: 刷新缓存*/
      hasPermission(permission){
        return  this.$store.getters.userInfo.permissions.includes(permission)
      },
      showMenuItem(itemName){
        
        if(this.$store.getters.userInfo.sysMenu.componentName == itemName){
          return true;
        }
		    if(this.$store.getters.userInfo.sysMenu.children && this.$store.getters.userInfo.sysMenu.children.length >0){
            return this.containInList(this.$store.getters.userInfo.sysMenu.children,itemName); 
        } 
       
        return false 
      },
      containInList(list,itemName){

        for (let i in list) {
          if(list[i].componentName == itemName){
            	return true
        	}
        if(list[i].children && list[i].children.length >0){
            let res=this.containInList(list[i].children,itemName);
            if(res){
                return res
            }
          }
        }  
		    return false

      }
    }
  }
</script>

<style lang="less" scoped>
  /* update_begin author:zhaoxin date:20191129 for: 让搜索框颜色能随主题颜色变换*/
  /* update-begin author:sunjianlei date:20191220 for: 解决全局样式冲突问题 */
  .user-wrapper .search-input {
    width: 180px;
    color: inherit;

    /deep/ .ant-select-selection {
      background-color: inherit;
      border: 0;
      border-bottom: 1px solid white;
      &__placeholder, &__field__placeholder {
        color: inherit;
      }
    }
  }
  /* update-end author:sunjianlei date:20191220 for: 解决全局样式冲突问题 */
  /* update_end author:zhaoxin date:20191129 for: 让搜索框颜色能随主题颜色变换*/
</style>

<style scoped>
  .logout_title {
    color: inherit;
    text-decoration: none;
  }
</style>