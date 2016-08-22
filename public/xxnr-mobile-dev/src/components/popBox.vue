<template>
  <div class="mask" v-show="popBoxDisplay"></div>
  <div class="confirm-order-box" v-show="popBoxDisplay">
    <div class="confirm-order-title">
      确认收货
      <div class="confirm-order-close" @click="hidePopBox();">
        <img src="/assets/images/close-box.png">
      </div>
    </div>
    <div class="confirm-product-box">
      <div class="confirm-product" v-for="item in orderSKUList.SKUList" v-if="item.deliverStatus == 2"  @click="selectConfirmProduct($index);">
        <div class="confirm-radio" :class="{'checked ': checkedSKUList[$index]}">

        </div>
        <div class="container">
          <div class="confirm-product-name">
            {{item.productName}}
          </div>
          <div class="confirm-product-sku" >
            <div v-if="item.attributes">
              <span v-for="attribute in item.attributes">{{attribute.name}}：{{attribute.value}}；</span>
            </div>
            <div v-if="item.additions.length != 0">
              附加项目：<span v-for="addition in item.additions">{{addition.name}}；</span>
            </div>
          </div>
          <div class="confirm-product-num">
            x{{item.count}}
          </div>
        </div>
      </div>
    </div>
    <div class="confirm-product-btn-box">
      <div class="confirm-product-btn" @click="confirmOrder();" :class="{'disabled': !hasSKUSelected}">
        确认<span v-if="hasSKUSelected">({{productNumber}})</span>
      </div>
    </div>
  </div>
  <div class="xxnr_order_toast" v-if="successToast">
    <div class="xxnr-toast-img">
      <img src="/assets/images/success.png">
    </div>
    <p class="xxnr-toast-wor">收货成功</p>
  </div>
  <div class="xxnr_order_toast" v-if="failureToast">
    <div class="xxnr-toast-img">
      <img src="/assets/images/failure.png">
    </div>
    <p class="xxnr-toast-wor">请稍后再试</p>
  </div>
</template>

<script>
  import { showPopBox, hidePopBox, selectConfirmProduct, confirmOrder, resetConfirmOrder } from '../vuex/actions'
  export default {
    data(){
      return{

      }
    },
    vuex: {
      getters: {
        orderSKUList: state => state.myOrders.orderSKUList,
        popBoxDisplay: state => state.myOrders.popBoxDisplay,
        checkedSKUList: state => state.myOrders.checkedSKUList,
        confirmOrderId: state => state.myOrders.confirmOrderId,
        hasSKUSelected: state => state.myOrders.hasSKUSelected,
        productNumber: state => state.myOrders.productNumber,
        failureToast: state => state.myOrders.failureToast,
        successToast: state => state.myOrders.successToast
      },
      actions: {
        showPopBox,
        hidePopBox,
        selectConfirmProduct,
        confirmOrder,
        resetConfirmOrder
      }
    },
    methods: {

    },
    detached(){
      this.resetConfirmOrder();
    }
  }
</script>

<style scoped>
  .confirm-order-box {
    position: fixed;
    width: 100%;
    background-color: #fff;
    bottom: 0;
    left: 0;
    z-index: 100;
  }

  .confirm-product-box {
    height: 250px;
    overflow: auto;
    padding-bottom: 60px;
  }

  .confirm-order-title {
    background-color: #FAFAFA;
    color: #323232;
    padding: 0 2%;
    line-height: 44px;
    height: 44px;
    position: relative;
    border-bottom: 1px solid #E0E0E0;
  }

  .confirm-order-close {
    position: absolute;
    width: 13px;
    height: 13px;
    right: 2%;
    top: 11px;
    padding: 5px;
  }

  .confirm-order-close img {
    width: 100%;
  }

  .confirm-product {
    position: relative;
    border-bottom: 1px solid #e2e2e2;
    padding: 10px 0 10px 30px;
    background-color: #fff
  }

  .confirm-radio {
    position: absolute;
    background: url('/static/assets/images/rsc_radio.png') 0 -18px no-repeat;
    width: 18px;
    height: 18px;
    top: 50%;
    left: 12px;
    margin-top: -9px;
  }

  .confirm-radio.checked {
    background-position: 0 0;
  }

  .confirm-product-sku {
    font-size: 14px;
    color: #909090;
  }

  .confirm-product-name {
    height: 20px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 80%;
    font-size: 16px;
  }

  .confirm-product-btn {
    width: 120px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background-color: #FE9B00;
    color: #fff;
    border-radius: 3px;
    margin: 10px auto 0;
  }

  .confirm-product-btn.disabled {
    background-color: #E2E2E2;
  }

  .confirm-product-num {
    position: absolute;
    right: 2%;
    top: 10px;
    line-height: 16px;
  }

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
    opacity: 0;
    -webkit-animation: fadeInOut 2s ease; /* Safari, Chrome and Opera > 12.1 */
    -moz-animation: fadeInOut 2s ease; /* Firefox < 16 */
    -ms-animation: fadeInOut 2s ease; /* Internet Explorer */
    -o-animation: fadeInOut 2s ease; /* Opera < 12.1 */
    animation: fadeInOut 2s ease;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
     opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .xxnr-toast-img {
    width: 100%;
    text-align: center;
    margin-top: 20px;
  }
  .xxnr-toast-img img {
    width: 60px;
  }

  .xxnr-toast-wor {
    text-align: center;
    margin-top: 15px;
  }

  .confirm-product-btn-box {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 50px;
    background-color: #fff;
    border-top: 1px solid #ccc;
  }
</style>
