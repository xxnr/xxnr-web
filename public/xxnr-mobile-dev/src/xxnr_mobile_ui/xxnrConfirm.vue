<template>
  <dialog class="weui_dialog_confirm"
          :show="show"
          :mask-transition="maskTransition"
          :dialog-transition="dialogTransition"
          @on-hide="$emit('on-hide')"
          @on-show="$emit('on-show')">
    <div class="weui_dialog_hd"><strong class="weui_dialog_title">{{title}}</strong></div>
    <div class="weui_dialog_bd"><slot></slot></div>
    <div class="weui_dialog_ft">
      <a href="javascript:;" class="weui_btn_dialog default" @click="onCancel">{{cancelText}}</a>
      <a href="javascript:;" class="weui_btn_dialog primary" @click=confirmMethod>{{confirmText}}</a>
    </div>
  </dialog>
</template>

<script>
  import  Dialog from './xxnrDialog.vue'
  export default {
    components: {
      Dialog
    },
    props: {
      show: {
        type: Boolean,
        default: false,
        twoWay: true
      },
      title: {
        type: String,
        required: true
      },
      confirmText: {
        type: String,
        default: '确定'
      },
      cancelText: {
        type: String,
        default: '取消'
      },
      maskTransition: {
        type: String,
        default: 'vux-fade'
      },
      dialogTransition: {
        type: String,
        default: 'vux-dialog'
      },
      confirmMethod: {
        type: Function
      }
    },
    methods: {
      onConfirm: function () {
        this.show = false
        this.$emit('on-confirm')
      },
      onCancel: function () {
        this.show = false;
        this.$emit('on-cancel')
      }
    },
    watch: {
      show: function (val) {
        if (val) {
          this.$emit('on-show')
        }
      }
    }
  }
</script>
