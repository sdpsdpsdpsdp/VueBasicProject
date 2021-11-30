<template>
  <a-config-provider :local='locale'>
    <div id='app'>
      <router-view v-if='isRouterAlive'/>
    </div>
  </a-config-provider>
</template>

<script>
import enquireScreen from "@/utils/device"

export default {
  provide() {
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      isRouterAlive: true
    }
  },
  computed: {
    locale() {
      return this.$store.getters.local
    }
  },
  created() {
    let that = this
    enquireScreen(deviceType => {
      // tablet
      if (deviceType === 0) {
        that.$store.commit("TOGGLE_DEVICE", "mobile")
        that.$store.dispatch("setSidebar", false)
      }
      // mobile
      else if (deviceType === 1) {
        that.$store.commit("TOGGLE_DEVICE", "mobile")
        that.$store.dispatch("setSidebar", false)
      } else {
        that.$store.commit("TOGGLE_DEVICE", "desktop")
        that.$store.dispatch("setSidebar", true)
      }
    })
  },
  methods: {
    reload() {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
