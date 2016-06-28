<template>
  <div class="order-done-box">
    <div class="order-done-bit"></div>
    <div class="order-done-tips">线下支付提交成功！</div>
    <div class="order-done-due">待支付金额： <span class="orange">{{orderInfo.rows.payment.price}}元</span></div>
  </div>
  <div>
    <div></div>
    <div class="order-done-title">请到服务网点完成线下支付</div>
  </div>
  <div class="order-done-block gray">
    服务网点
  </div>
  <div v-if="orderInfo.rows.RSCInfo">
    <div class="order-done-line">
      <div class="order-done-attr">
        网点名称
      </div>
      <div class="order-done-value">
        {{orderInfo.rows.RSCInfo.companyName}}
      </div>
      <div class="clear"></div>
    </div>
    <div class="order-done-line">
      <div class="order-done-attr">
        地址
      </div>
      <div class="order-done-value">
        {{orderInfo.rows.RSCInfo.RSCAddress}}
      </div>
      <div class="clear"></div>
    </div>
    <div class="order-done-line">
      <div class="order-done-attr">
        电话
      </div>
      <div class="order-done-value">
        {{orderInfo.rows.RSCInfo.RSCPhone}}
      </div>
      <div class="clear"></div>
    </div>
  </div>
  <div v-else>
    <div class="no-rsc-img">
      <img src="../../../static/assets/images/no_RSC.png">
    </div>
    <div class="no-rsc-wor">
      小新正在为您匹配最近的网点，请稍后从我的订单查看
    </div>
  </div>
  <div class="order-done-block gray margin-top-10">付款方式</div>
  <div class="order-done-block">现金</div>
  <div class="order-done-block">POS机刷卡</div>
</template>

<script>
  import { getOrderDetail, editTitle, showBackBtn, setRightButtonText, showRightBtn, hideRightBtn } from '../../vuex/actions'

  export default {
    vuex: {
      getters: {
        orderInfo: state => state.order.orderInfo
    },
    actions: {
      getOrderDetail,
      editTitle,
      showBackBtn,
      setRightButtonText,
      showRightBtn,
      hideRightBtn
    }
  },
  detached(){
    this.hideRightBtn();
    this.setRightButtonText('','');
  },
  route: {
    activate(transition) {
      this.getOrderDetail();
      this.showBackBtn();
      this.setRightButtonText('查看订单', 'my_orders/myPayingOrders');
      this.showRightBtn();
      this.editTitle('线下支付');
      transition.next();
    }
  }
  }
</script>

<style scoped>
  .orange {
    color: #FE9B00;
  }

  .order-done-title {
    line-height: 40px;
    height: 40px;
    padding: 0 2%;
    border: 1px solid #e7e7e7;
  }

  .order-done-line {
    position: relative;
    font-size: 16px;
    line-height: 18px;
    padding: 13px 0 13px 77px;
    color: #323232;
    background-color: #fff;
    border-bottom: 1px solid #E7E7E7;
    min-height: 18px;
  }

  .order-done-attr {
    position: absolute;
    left: 2%;
    color: #646464;
  }

  .order-done-value {
    color: #323232;
  }

  .order-done-block {
    font-size: 16px;
    line-height: 44px;
    padding: 0 2%;
    color: #323232;
    background-color: #fff;
    border-bottom: 1px solid #E7E7E7;
  }

  .gray {
    color: #646464;
  }

  .margin-top-10 {
    margin-top: 10px;
    border-top: 1px solid #e7e7e7;
  }

  .order-done-bit {
    position: absolute;
    width: 51px;
    height: 50px;
    left: 2%;
    top: 20px;
    background: url('/static/assets/images/offline_payment2.png') 0 0 no-repeat;
  }

  .order-done-box {
    position: relative;
    height: 90px;
    background-color: #fff;
  }

  .order-done-due {
    position: absolute;
    top: 50px;
    font-size: 14px;
    left: 84px;
  }

  .order-done-tips {
    position: absolute;
    left: 84px;
    top: 20px;
  }

  .no-rsc-wor {
    font-size: 12px;
    text-align: center;
    color: #909090;
    background-color: #fff;
    padding-bottom: 23px;
    border-bottom: 1px solid #e7e7e7;
  }

  .no-rsc-img {
    background-color: #fff;
    text-align: center;
  }

  .no-rsc-img img {
    width: 63px;
    padding: 28px 0 29px;
  }

</style>
