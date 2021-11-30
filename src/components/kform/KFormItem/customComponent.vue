<!--
 * @Descripttion: 
 * @Author: kcz
 * @Date: 2021-05-02 16:04:02
 * @LastEditors: kcz
 * @LastEditTime: 2021-05-14 21:24:50
-->
<template>
  <a-form-item
    :label="record.label"
    :label-col="
      formConfig.layout === 'horizontal'
        ? formConfig.labelLayout === 'flex'
          ? { style: `width:${formConfig.labelWidth}px` }
          : formConfig.labelCol
        : {}
    "
    :wrapper-col="
      formConfig.layout === 'horizontal'
        ? formConfig.labelLayout === 'flex'
          ? { style: 'width:auto;flex:1' }
          : formConfig.wrapperCol
        : {}
    "
    :style="
      formConfig.layout === 'horizontal' && formConfig.labelLayout === 'flex'
        ? { display: 'flex' }
        : {}
    "
  >
    <component
      :record="record"
      :style="`width:${record.options.width}`"
       @change="handleChange"
       @input="handleInput"
      :disabled="disabled"
      :dynamicData="dynamicData"
      :conditions="cd"
      :options="record.options"
      :height="
        typeof record.options.height !== 'undefined'
          ? record.options.height
          : ''
      "
      v-decorator="[
        record.model,
        {
          initialValue: record.options.defaultValue,
          rules: record.rules
        }
      ]"
      :is="customComponent"
    ></component>
  </a-form-item>
</template>
<script>
export default {
  name: "customComponent",
  props: ["record", "formConfig", "disabled", "dynamicData"],
  computed: {
    customComponent() {
      // 计算需要显示的组件
      const customComponentList = {};
      if (window.$customComponentList) {
        // 将数组映射成json
        window.$customComponentList.forEach(item => {
          customComponentList[item.type] = item.component;
        });
      }
      window.re=customComponentList[this.record]
      window.cm=customComponentList[this.record.type]
      return customComponentList[this.record.type];
    },
    cd(){
      return JSON.parse(this.record.options.data)
    }
  },
  methods: {
    handleChange(value, key) {
      //console.log("捕获change传值",value,key)
      this.$emit("change", value, key);
    },
    handleInput(value, key){
     // console.log("捕获input",value,key)
      this.$emit("input", value);
    }
  },
   mounted() {
     //console.log("customer compnent mounted",this.record)
  },
};
</script>
