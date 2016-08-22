<template>
  <div class="order-line-top"></div>
  <div class="order-rsc-info">
    <div class="container">
      <div class="order-rsc" v-link="{path: rscLink}">
        <div class="order-rsc-bit"></div>
        <span v-if="!orderRSC.address">订单中的商品将配送至服务站，请选择自提网点</span>
        <div class="order-address-arrow" v-if="!orderRSC.address">
          <img src="/assets/images/arrow.png">
        </div>
        {{orderRSC.address}}
      </div>
      <div class="order-consignee" v-link="{path: consigneeLink}">
        <div class="order-consignee-bit"></div>
        <span v-if="!orderConsignee.consigneePhone">请填写收货人信息</span>
        <div class="order-address-arrow" v-if="!orderConsignee.consigneePhone">
          <img src="/assets/images/arrow.png">
        </div>
        {{orderConsignee.consigneeName}}
        {{orderConsignee.consigneePhone}}
      </div>
    </div>
  </div>
  <div class="order-line-bottom"></div>
</template>

<script>
  export default {
    props: {
      orderRSC: null,
      orderConsignee: null,
      rscLink: {
        type: String
      },
      consigneeLink: {
        type: String
      }
    }
  }
</script>

<style>
  .order-rsc-info {
    font-size: 13px;
    background-color: #FFFCF6;
  }

  .product-img img {
    width: 100%;
  }

  .order-rsc, .order-consignee {
    position: relative;
    line-height: 15px;
    padding: 10px 0 10px 18px;
    min-height: 15px;
  }

  .order-rsc {
    border-bottom: 1px solid #E2E2E2;
  }

  .order-rsc-bit {
    width: 13px;
    height: 17px;
    background: url('/static/assets/images/position.png') 0 0 no-repeat;
  }

  .order-consignee-bit {
    width: 16px;
    height: 16px;
    background: url('/static/assets/images/call-contact.png') 0 0 no-repeat;
  }

  .order-rsc-bit, .order-consignee-bit {
    position: absolute;
    left: 0;
    top: 10px;
  }

  .order-line-top {
    width: 100%;
    height: 3px;
    background: url('/static/assets/images/order_line_top.png') 0 0 repeat-x;
  }

  .order-line-bottom {
    width: 100%;
    height: 3px;
    background: url('/static/assets/images/order_line_bottom.png') 0 0 repeat-x;
  }

  .order-address-arrow {
    position: absolute;
    right: 2%;
    width: 8px;
    top: 11px;
  }

  .order-address-arrow img {
    width: 100%;
  }
</style>
