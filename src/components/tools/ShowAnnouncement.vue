<template>
  <j-modal
    :title='title'
    
    :visible='visible'
    :width="600"
    :bodyStyle='bodyStyle'
    :switchFullscreen='switchFullscreen'
    @cancel='handleCancel'
  >
    <template slot='footer'>
      <a-button key='back' @click='handleCancel'>{{ $t('order.close') }}</a-button>
      <a-button v-if="record.openType==='url'" type='primary' @click='toHandle'>{{ $t('order.previewAndHandle') }}
      </a-button>
    </template>
    <a-card class='daily-article' :loading='loading'>
      <a-card-meta
        :title="getTitle(record)"
        :description="getDes(record)">
      </a-card-meta>
      <a-textarea v-model="record.msgContent" disabled />
      <!-- <span v-html='record.msgContent' class='article-content'></span> -->
    </a-card>
  </j-modal>
</template>

<script>
export default {
  name: 'SysAnnouncementModal',
  components: {},
  data() {
    return {
      title: this.$t('order.Notify'),
      record: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      visible: false,
      switchFullscreen: true,
      loading: false,
      bodyStyle: {
        padding: '0',
      
        height: (window.innerHeight * 0.4) + 'px',
        'overflow-y': 'auto'

      },
      modelStyle: {
        width: '60%',
        style: { top: '20px' },
        fullScreen: false
      }
    }
  },
  created() {
  },
  methods: {
     getTitle(record){
       let title=record.title
       title =this.$t('order.label')+":   "+title
       let r=<h3>{title}</h3>
       return r
     },
    getDes(record){
     let str = <p><font > {this.$t('order.sender')+':'} </font ><font color="#409eff" >{(record.senderRealName?record.senderRealName:record.sender)}</font ><font >{'  ,  '+ this.$t('order.sendTime')+':'}</font > <font color="#409eff" > {record.sendTime}</font ></p>
        let q = <p style="font-size: 14px;color: #409eff;margin: 0;"> {str}</p>
      return str
    },

    detail(record) {
      this.visible = true
      this.record = record
      console.log('record', this.record)
    },
    handleCancel() {
      this.visible = false
    },
    /** 切换全屏显示 */
    handleClickToggleFullScreen() {
      let mode = !this.modelStyle.fullScreen
      if (mode) {
        this.modelStyle.width = '100%'
        this.modelStyle.style.top = '20px'
      } else {
        this.modelStyle.width = '60%'
        this.modelStyle.style.top = '50px'
      }
      this.modelStyle.fullScreen = mode
    },
    toHandle() {
      if (this.record.openType === 'url') {
        this.visible = false
        //链接跳转
        console.log(this.record.openPage)
        this.$router.push({ path: this.record.openPage })
      }
    }
  }
}
</script>

<style lang='less'>
.announcementCustomModal {
  .ant-modal-header {
    border: none;
    display: inline-block;
    position: absolute;
    z-index: 1;
    right: 56px;
    padding: 0;

    .ant-modal-title {
      .custom-btn {
        width: 56px;
        height: 56px;
        border: none;
        box-shadow: none;
      }
    }
  }

  .daily-article {
    border-bottom: 0;
  }
}
</style>
<style scoped lang='less'>
.daily-article {
  .article-button {
    font-size: 1.2rem !important;
  }

  .ant-card-body {
    padding: 18px !important;
  }

  .ant-card-head {
    padding: 0 1rem;
  }

  .ant-card-meta {
    margin-bottom: 1rem;
  }
  .ant-input-disabled {
    color: #303133;
  background-color: transparent;
  cursor: pointer;
  opacity: 1;
}

  .article-content {
    p {
      word-wrap: break-word;
      word-break: break-all;
      text-overflow: initial;
      white-space: normal;
      font-size: .9rem !important;
      margin-bottom: .8rem;
    }
  }
}
</style>
