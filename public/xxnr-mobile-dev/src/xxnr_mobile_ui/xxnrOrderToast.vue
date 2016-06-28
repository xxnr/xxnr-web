<template>
  <div id="toast" v-show="show">
    <!--<div class="xxnr_mask_transparent"></div>-->
    <div class="xxnr_order_toast" :class="{'xxnr_toast_forbidden': type == 'warn', 'xxnr_toast_cancel': type == 'cancel'}">
      <div class="xxnr-toast-img">
        <slot></slot>
      </div>
      <p class="xxnr_order_toast_content"><slot></slot></p>
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
  .xxnr_order_toast{
    position: fixed;
    width: 180px;
    height: 140px;
    background-color: #000;
    opacity: .8;
    top: 50%;
    left: 50%;
    margin-top: -70px;
    margin-left: -90px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
    -moz-animation: fadein 1s; /* Firefox < 16 */
    -ms-animation: fadein 1s; /* Internet Explorer */
    -o-animation: fadein 1s; /* Opera < 12.1 */
    animation: fadein 1s;

  }

  .xxnr-toast-img {
    width: 100%;
    text-align: center;
    margin-top: 20px;
  }
  .xxnr-toast-img img {
    width: 40px;
  }

  .xxnr-toast-wor {
    text-align: center;
    margin-top: 15px;
  }
</style>
