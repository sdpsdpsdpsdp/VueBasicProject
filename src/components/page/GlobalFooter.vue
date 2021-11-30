<template>
  <div  >
    <div v-if="showType('laison')" class="footer">
      <div class="links">
      <a href="http://www.laisongroup.com/" target="_blank">Laison Tech</a>
      </div>
      <div class="copyright" >
        Copyright
        <a-icon type="copyright"/>
        2021 <span>Laison Tech</span>
      </div>
    </div>
    <div  v-if="showType('Metrotec')"   class="footer">
      <div class="links">
      <a href="http://www.metrotecegypt.com/" target="_blank">Metrotec</a>
      </div>
      <div class="copyright" >
        Copyright
        <a-icon type="copyright"/>
        2021 <span>Metrotec</span>
      </div>
    </div>
   
  </div>
</template>

<script>
  export default {
    name: "LayoutFooter",
    methods: {
      showType(type){
         return this.$store.getters.userInfo.sysDept.config.footType==type
      }
    }
  }
</script>

<style lang="less" scoped>
  .footer {
    padding: 0 16px;
    margin: 48px 0 24px;
    text-align: center;

    .links {
      margin-bottom: 8px;

      a {
        color: rgba(0, 0, 0, .45);

        &:hover {
          color: rgba(0, 0, 0, .65);
        }

        &:not(:last-child) {
          margin-right: 40px;
        }
      }
    }
    .copyright {
      color: rgba(0, 0, 0, .45);
      font-size: 14px;
    }
  }
</style>