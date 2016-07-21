<template>
  <div id="toast" v-show="show">
    <!--<div class="xxnr_mask_transparent"></div>-->
    <div class="xxnr_toast" :class="{'xxnr_toast_forbidden': type == 'warn', 'xxnr_toast_cancel': type == 'cancel'}">
      <p class="xxnr_toast_content"><slot></slot></p>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      show: {
        type: Boolean,
        default: false
      },
      time: {
        type: Number,
        default: 2500
      },
      type: {
        type: String,
        default: ''
      }
    },
    watch: {
      show: function (val) {
        const _this = this
        if (val) {
          clearTimeout(this.timeout)
          this.timeout = setTimeout(function () {
            _this.show = false
          }, _this.time)
        }
      }
    }
  }
</script>
<style>
  .xxnr_toast{
    position: fixed;
    bottom: 40px;
    width: 75%;
    left: 50%;
    transform: translateX(-50%);
    background-color:rgba(0,0,0,0.4);
    color: #EAF8F4;
    border-radius: 5px;
    text-align: center;
    line-height: 20px;
    z-index: 102;
    -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
    -moz-animation: fadein 1s; /* Firefox < 16 */
    -ms-animation: fadein 1s; /* Internet Explorer */
    -o-animation: fadein 1s; /* Opera < 12.1 */
    animation: fadein 1s;
    padding: 5px;
  }
</style>
