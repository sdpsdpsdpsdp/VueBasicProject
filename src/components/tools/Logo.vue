<template>
  <div class="logo">
    <router-link :to="{ name: 'dashboard' }" style="display: flex;justify-content:center;align-items:center;width: 100%;height: 100%">
      <!-- update-begin- author:sunjianlei --- date:20190814 --- for: logo颜色根据主题颜色变化 -->
      <img v-if="navTheme === 'dark'" src="~@/assets/metromin-white.png" alt="logo" :class="{ 'show-title': !showTitle }" />
      <img v-else src="~@/assets/metromin.png" alt="logo" :class="{ 'show-title': !showTitle }" />
      <!--<img src="~@/assets/metromin.png" alt="logo" style="height: 45px;display: block;margin: 7px 0">-->
      <!--<img src="~@/assets/metromin.png" alt="logo">-->

      <h1 v-if="showTitle">{{ $t(title) }}</h1>
      <!--      <div class="icon-wrapper" v-if="showTitle">{{ title }} </div>-->
    </router-link>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixin.js'

export default {
  name: 'Logo',
  mixins: [mixin],
  props: {
    title: {
      type: String,
      default: 'common.logotext',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>
<style lang="less" scoped>
/*缩小首页布 局顶部的高度*/
@height: 59px;

.sider {
  box-shadow: none !important;
  .logo {
    height: @height !important;
    line-height: @height !important;
    box-shadow: none !important;
    transition: background 300ms;
    a {
      color: white;
      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }
    }
    .icon-wrapper {
      font-weight: bold;
      font-size: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    img {
      width: 32px;
      height: 32px;
      transition: all 0.3s;
    }
    .show-title {
      width: 42px;
      height: 42px;
      transition: all 0.3s;
    }
  }

  &.light .logo {
    background-color: @primary-color;
  }
}
</style>
