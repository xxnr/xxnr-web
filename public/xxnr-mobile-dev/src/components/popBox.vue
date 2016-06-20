<template>
  <div class="mask" v-show="popBoxDisplay"></div>
  <div class="confirm-order-box" v-show="popBoxDisplay">
    <div class="confirm-order-title">
      确认收货
      <div class="confirm-order-close" @click="hidePopBox();">
        <img src="../../static/assets/images/close-box.png">
      </div>
    </div>
    <div class="confirm-product" v-for="item in orderSKUList.SKUList" v-if="item.deliverStatus == 2"  @click="selectConfirmProduct($index);">
      <div class="confirm-radio" :class="{'checked ': checkedSKUList[$index]}">

      </div>
      <div class="container">
        <div class="confirm-product-name">
          {{item.productName}}
        </div>
        <div class="confirm-product-sku" >
          <span v-if="item.attributes" v-for="attribute in item.attributes">{{attribute.name}}：{{attribute.value}}；</span>
          <span v-if="item.additions" v-for="addition in item.additions">{{addition.name}}：{{addition.value}}；</span>
        </div>
      </div>
    </div>
    <div class="confirm-product-btn" @click="confirmOrder();" :class="{'disabled': !hasSKUSelected}">
      确认
    </div>
  </div>
</template>

<script>
  import { showPopBox, hidePopBox, selectConfirmProduct, confirmOrder } from '../vuex/actions'

  export default {
    vuex: {
      getters: {
        orderSKUList: state => state.myOrders.orderSKUList,
        popBoxDisplay: state => state.myOrders.popBoxDisplay,
        checkedSKUList: state => state.myOrders.checkedSKUList,
        confirmOrderId: state => state.myOrders.confirmOrderId,
        hasSKUSelected: state => state.myOrders.hasSKUSelected
        },
      actions: {
        showPopBox,
        hidePopBox,
        selectConfirmProduct,
        confirmOrder
      }
    },
    methods: {

    }
  }
</script>

<style scoped>
  .confirm-order-box {
    position: fixed;
    width: 100%;
    height: 60%;
    background-color: #fff;
    bottom: 0;
    left: 0;
    z-index: 100;
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
    border-bottom: 1px solid #c7c7c7;
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
    position: absolute;
    bottom: 10px;
    left: 50%;
    margin-left: -60px;
  }

  .confirm-product-btn.disabled {
    background-color: #E2E2E2;
  }
</style>
