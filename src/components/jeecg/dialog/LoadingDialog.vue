<template>
  <div v-if='showMask' class='toast-container' @touchmove.prevent>
    <!-- 这里content为双花括号 -->
    <span class='loading-txt'>{{ content }}</span>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showMask: true,
      content:'xxxxxxxx'
    }
  },
  methods: {},
  mounted() {
    this.showMask = this.value
  },
  watch: {
    value(newVal, oldVal) {
      this.showMask = newVal
    }
  }
}
</script>
<style lang='scss' scoped>
.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
}

.toast-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  padding: 35px;
  border-radius: 10px;
  font-size: 28px;
  line-height: 36px;
  background: #eee;
  color: #666;
}

.loading-txt {
  font-size: 20px;
}
</style>