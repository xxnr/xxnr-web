<template>
  <div class="ordersProductsRows clearfix">
    <div class="orderRow" v-for="order in orders">
      <template v-if="order.SKUs.length>0">
        <div class="productRow" v-for="SKU in order.SKUs">
          <div class="orders-product-img">
            <img :src="SKU.thumbnail">
          </div>
          <div class="orders-product-info">
            <div class="orders-product-name">
              {{SKU.name}}
            </div>
            <div class="orders-product-count" v-else>
              ×{{SKU.count}}
            </div>
          </div>
        </div>
      </template>
      <!--为了兼容没上SKU之前的商品-->
      <template v-else>
        <div v-else class="productRow" v-for="SKU in order.products">
          <div class="orders-product-img">
            <img :src="SKU.thumbnail">
          </div>
          <div class="orders-product-info">
            <div class="orders-product-name">
              {{SKU.name}}
            </div>
            <div class="orders-product-count" v-else>
              ×{{SKU.count}}
            </div>
          </div>
        </div>
      </template>
      <div class="action-box">
        <div class="action-wor" v-if="order.order.orderStatus.type == 3">待发货</div>
        <input type="button" v-if="order.order.orderStatus.type == 1 || order.order.orderStatus.type == 2" class="action-btn" value="去付款" @click="payOrder(order.id);">
        <input type="button" v-if="order.order.orderStatus.type == 4 && order.isShowC" class="action-btn" value="确认收货" @click="getOrderDetailById(order.id);">
        <input type="button" v-if="order.order.orderStatus.type == 5 && order.isShowD" class="action-btn" value="去自提" @click="selfDelivery(order.id);">
        <input type="button" v-if="order.order.orderStatus.type == 7" class="action-btn" value="查看付款信息" @click="checkPayInfo(order.id);">
        <div class="order-total-price">
          合计：<span class="orange">¥{{order.order.totalPrice}}</span>
        </div>
      </div>
    </div>
</template>

<script>
  import { getOrderDetailById, offlinePay } from '../vuex/actions'

  export default {
    props: ['orders'],
    vuex: {
      getters: {

    },
    actions: {
      getOrderDetailById
    }
  },
  methods: {
    payOrder: function (id) {
      console.log(id);
      window.location.href = '/#!/offlinePay?id=' + id;
    },
    selfDelivery: function (id) {
      window.location.href = '/#!/selfDelivery?id=' + id;
    },
    checkPayInfo: function (id) {
      window.location.href = '/#!/orderDone?id=' + id;
    }

  }
  }
</script>

<style scoped>
  .ordersProductsRows{
    background: #FAFAFA;
  }
  .orderRow{
    margin-bottom: 10px;
    background: #FFFFFF;
    border-top: 1px solid #c7c7c7;
  }
  .productRow{
    border-bottom: 1px solid #c7c7c7;
    padding: 10px;
  }
  .orders-product-img{
    height: 90px;
    width: 90px;
    border:1px solid #c7c7c7;
    display: inline-block;
    box-sizing: border-box;
  }
  .orders-product-info{
    display: inline-block;
    position: absolute;
    left: 108px;
    color:#323232;
  }
  .orders-product-name{
    height: 40px;
    line-height: 20px;
    overflow: hidden;
    margin-bottom: 12px;
    padding-right: 10px;
  }
  .orders-product-count{
    font-size: 20px;
  }

  .action-box {
    border-bottom: 1px solid #c7c7c7;
    position: relative;
    height: 44px;
  }

  .action-box .action-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    height: 26px;
    line-height: 26px;
    background-color: #FE9B00;
    color: #fff;
    text-align: center;
    padding: 0 13px;
    border-radius: 5px;
  }

  .order-total-price {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .orange {
    color: #FF8822;
  }

  .action-wor {
    color: #fe9b00;
    line-height: 44px;
    padding-left: 2%;
    font-size: 14px;
  }


</style>
