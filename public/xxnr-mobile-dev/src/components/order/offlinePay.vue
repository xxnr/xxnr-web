<template>
  <div class="order-info">
    <div class="order-id">
      <div class="container">
        订单号：{{orderInfo.rows.id}}
        <div class="order-type">
          <span v-if="orderInfo.rows.paySubOrderType == 'deposit'">阶段一：订金</span>
          <span v-if="orderInfo.rows.paySubOrderType == 'balance'">阶段二：尾款</span>
          <span v-if="orderInfo.rows.paySubOrderType == 'fill'">全款</span>
        </div>
      </div>
    </div>
    <div class="order-price">
      <div class="container">
        <div class="order-price-line">
          待付金额：<span class="orange">{{orderInfo.rows.payment.price}}元</span>
        </div>
        <div class="order-price-line">
          订单总额：<span class="orange">{{orderInfo.rows.totalPrice}}元</span>
        </div>
      </div>
    </div>
  </div>
  <div class="order-done-title">
    付款方式
  </div>
  <div class="order-pay-type">
    <div class="order-pay-type-bit"></div>
    <div class="order-pay-type-wor">线下支付</div>
    <div class="order-pay-type-radio"></div>
  </div>
  <div class="order-pay-type-tips">请到服务网点，付现金或POS机刷卡完成支付</div>
  <div class="order-done-title">
    其他付款方式
  </div>
  <div class="order-done-tips">
    您可下载新新农人APP，或者登陆电脑版网站，选择更多的支付方式
  </div>
  <div @click="offlinePay(orderInfo.rows.id, orderInfo.rows.payment.price);" div class="order-done-btn">
    去支付
  </div>
</template>

<script>
  import { offlinePay, getOrderDetail, editTitle, showBackBtn, hideRightBtn } from '../../vuex/actions'

  export default {
    vuex: {
      getters: {
        orderInfo: state => state.order.orderInfo
    },
    actions: {
      offlinePay,
      getOrderDetail,
      editTitle,
      showBackBtn
    }
  },
  route: {
    activate(transition) {
      this.getOrderDetail();
      this.showBackBtn();
      this.editTitle('选择支付方式');
      transition.next();
    }
  }
  }
</script>

<style scoped>
  .order-info {
    margin-top: 10px;
  }

  .order-id {
    position: relative;
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    background-color: #fffaf6;
    border-top: 1px solid #E9E9E9;
    border-bottom: 1px solid #E9E9E9;
  }

  .order-type {
    font-size: 14px;
    color: #646464;
    position: absolute;
    top: 0;
    right: 2%;
    line-height: 44px;
  }

  .order-price {
    padding: 10px 0;
    background-color: #fffaf6;
    border-bottom: 1px solid #E9E9E9;
  }

  .order-price-line {
    font-size: 14px;
    line-height: 20px;
  }

  .orange {
    color: #ff4e00;
  }

  .order-done-title {
    padding: 0 2%;
    background-color: #f0f0f0;
    font-size: 16px;
    color: #646464;
    line-height: 44px;
    height: 44px;
    margin-top: 10px;
  }

  .order-done-tips {
    padding: 0 2%;
    margin: 20px 0;
    font-size: 14px;
    color: #909090;
    line-height: 20px;
  }

  .order-done-btn {
    margin: 138px 2% 40px;
    height: 44px;
    line-height: 44px;
    background-color: #FE9B00;
    color: #fff;
    text-align: center;
    border-radius: 5px;
  }

  .order-pay-type {
    position: relative;
    height: 44px;
    line-height: 44px;
    font-size: #323232;
  }

  .order-pay-type-bit {
    position: absolute;
    left: 2%;
    top: 8px;
    width: 48px;
    height: 48px;
    background: url('/static/assets/images/offline_payment.png') 0 0 no-repeat;
  }

  .order-pay-type-wor {
    position: absolute;
    left: 48px;
  }

  .order-pay-type-radio {
    position: absolute;
    right: 2%;
    top: 10px;
    width: 18px;
    height: 18px;
    background: url('/static/assets/images/rsc_radio.png') 0 0 no-repeat;
  }

  .order-pay-type-tips {
    padding: 0 2%;
    font-size: 14px;
    color: #909090;
    line-height: 20px;
  }
</style>
