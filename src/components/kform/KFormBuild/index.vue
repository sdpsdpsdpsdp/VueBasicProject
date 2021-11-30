<template>
  <a-config-provider>
    <a-form v-if="
        typeof value.list !== 'undefined' && typeof value.config !== 'undefined'
      " class="k-form-build-9136076486841527" :layout="value.config.layout" :hideRequiredMark="value.config.hideRequiredMark" :form="form" @submit="handleSubmit" :style="value.config.customStyle">
      <buildBlocks ref="buildBlocks" @handleReset="reset" v-for="(record, index) in cvalue.list" :record="record" :dynamicData="getDynamicData" :config="config" :disabled="disabled" :formConfig="value.config" :validatorError="validatorError" :key="index" @change="handleChange" @input="handleInput" />
    </a-form>
  </a-config-provider>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 * description 将json数据构建成表单
 */
import buildBlocks from "./buildBlocks";
// import moment from "moment";
export default {
  name: "KFormBuild",
  created() {
    this.form = this.$form.createForm(this)
  },
  watch: {

    value: {//深度监听，可监听到对象、数组的变化
      handler(val, oldVal) {
      },
      deep: true //true 深度监听
    }
  },
  data() {
    return {

      form: this.$form.createForm(this),
      validatorError: {},
      defaultDynamicData: {}

    };
  },
  // props: ["value", "dynamicData"],
  props: {
    value: {
      type: Object,
      required: true
    },
    dynamicData: {
      type: Object,
      default: () => {
        return {};
      }
    },
    config: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    outputString: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    buildBlocks
  },
  computed: {
    cvalue() {

      console.log("hhhhhhhh", this.value)
      let res = {}
      if (this.value.list && this.value.list.length > 0) {
        res.list = JSON.parse(JSON.stringify(this.value.list))
        res.list.forEach(v => {
          if (v.label) {
            v.label = this.$t(v.label)
          }
          if (v.options) {
            if (v.options.placeholder) {

              v.options.placeholder = this.$t(v.options.placeholder)
            }
            if (v.options.options) {
              v.options.options.forEach(ov => {
                ov.label = this.$t(ov.label)
              })
            }

          }
        })
      }
      return res
    },
    getDynamicData() {
      return typeof this.dynamicData === "object" &&
        Object.keys(this.dynamicData).length
        ? this.dynamicData
        : window.$kfb_dynamicData || {};
    }
  },
  methods: {
    // moment,
    handleSubmit(e) {
      // 提交按钮触发，并触发submit函数，返回getData函数
      e.preventDefault();
      this.$emit("submit", this.getData);
    },
    reset() {
      // 重置表单
      this.form.resetFields();
    },
    getData() {
      // 提交函数，提供父级组件调用
      return new Promise((resolve, reject) => {
        try {
          this.form.validateFields((err, values) => {
            if (err) {
              reject(err);
              /**
               * @author: lizhichao<meteoroc@outlook.com>
               * @Description: 多容器校验时，提供error返回给多容器进行判断。
               */
              this.validatorError = err;
              return;
            }
            this.validatorError = {};
            this.$refs.buildBlocks.forEach(item => {
              if (!item.validationSubform()) {
                reject(err);
              }
            });
            if (this.outputString) {
              // 需要所有value转成字符串
              for (const key in values) {
                const type = typeof values[key];
                if (type === "string" || type === "undefined") {
                  continue;
                } else if (type === "object") {
                  values[key] = `k-form-design#${type}#${JSON.stringify(
                    values[key]
                  )}`;
                } else {
                  values[key] = `k-form-design#${type}#${String(values[key])}`;
                }
              }
              resolve(values);
            } else {
              resolve(values);
            }
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      });
    },
    setData(json) {
      return new Promise((resolve, reject) => {
        try {
          if (this.outputString) {
            // 将非string数据还原
            for (const key in json) {
              if (!json[key].startsWith("k-form-design#")) {
                continue;
              }
              const array = json[key].split("#");
              if (array[1] === "object") {
                json[key] = JSON.parse(array[2]);
              } else if (array[1] === "number") {
                json[key] = Number(array[2]);
              } else if (array[1] === "boolean") {
                json[key] = Boolean(array[2]);
              }
            }
            this.form.setFieldsValue(json);
          } else {
            this.form.setFieldsValue(json);
          }
          resolve(true);
        } catch (err) {
          console.error(err);
          reject(err);
        }
      });
    },

    // 批量设置某个option的值
    setOptions(fields, optionName, value) {
      fields = new Set(fields);

      // 递归遍历控件树
      const traverse = array => {
        array.forEach(element => {
          if (fields.has(element.model)) {
            this.$set(element.options, optionName, value);
          }
          if (element.type === "grid" || element.type === "tabs") {
            // 栅格布局 and 标签页
            element.columns.forEach(item => {
              traverse(item.list);
            });
          } else if (element.type === "card" || element.type === "batch") {
            // 卡片布局 and  动态表格
            traverse(element.list);
          } else if (element.type === "table") {
            // 表格布局
            element.trs.forEach(item => {
              item.tds.forEach(val => {
                traverse(val.list);
              });
            });
          }
        });
      };
      traverse(this.value.list);
    },
    // 隐藏表单字段
    hide(fields) {
      this.setOptions(fields, "hidden", true);
    },
    // 显示表单字段
    show(fields) {
      if (fields) {
        this.setOptions(fields, "hidden", false);
      }
    },
    // 禁用表单字段
    disable(fields) {
      this.setOptions(fields, "disabled", true);
    },
    // 启用表单字段
    enable(fields) {
      this.setOptions(fields, "disabled", false);
    },
    handleChange(value, key) {
      // 触发change事件
      this.$emit("change", value, key);
    },

    async handleInput(value) {//这里处理自定义组件的model赋值  这里已经用不到了  自定义组件里都emit change事件

      this.$emit("input", value);
      let oldData = {}

      try {
        oldData = await this.getData()
      } catch (e) {
        console.error(e)
      }
      console.log("oldData", oldData)
      let needAdd = true
      for (let key in oldData) {
        if (key == value.model) {
          needAdd = false
          oldData[key] = value
        }
      }
      if (needAdd) {
        oldData[value.model] = value
      }
      delete value[value.model]
      this.setData(oldData);

    }
  },
  mounted() {
    
    this.$nextTick(() => {

      this.setData(this.defaultValue);

    });

    // @jayce jsEnhance
    try {
      if(this.value.config && this.value.config.jsEnhance){
        Function('"use strict";' + this.value.config.jsEnhance)();
      }
    } catch (err) {
      console.error('accur error duaring jsEnhance execution:', err);
    }
  }
};
</script>
