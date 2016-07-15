<template>
  <div class="ordersProductsRows clearfix">
    <div class="orderRow" v-for="order in orders">
      <template v-if="order.SKUs.length>0">
        <div class="productRow" v-for="SKU in order.SKUs">
          <div class="orders-product-img">
            <img :src="SKU.thumbnail" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
          </div>
          <div class="orders-product-info">
            <div class="orders-product-name">
              {{SKU.productName}}
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
            <img :src="SKU.thumbnail" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
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
        <div class="action-wor" v-if="order.order.orderStatus.type == 0">已关闭</div>
        <div class="action-wor" v-if="order.order.orderStatus.type == 6">已完成</div>
        <div class="action-wor" v-if="order.order.orderStatus.type == 4 && !order.isShowC" >配送中</div>
        <div class="action-wor" v-if="order.order.orderStatus.type == 5 && !order.isShowD">待自提</div>
        <input type="button" v-if="order.order.orderStatus.type == 1 || order.order.orderStatus.type == 2" class="action-btn" value="去付款" v-link="{path: '/offlinePay?id=' + order.id}">
        <input type="button" v-if="order.order.orderStatus.type == 4 && order.isShowC" class="action-btn" value="确认收货" @click="getOrderDetailById(order.id);">
        <input type="button" v-if="order.order.orderStatus.type == 5 && order.isShowD" class="action-btn" value="去自提" v-link="{path: '/selfDelivery?id=' + order.id}">
        <input type="button" v-if="order.order.orderStatus.type == 7" class="action-btn" value="查看付款信息" v-link="{path: '/orderDone?id=' + order.id}">
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
    data: {

    },
    vuex: {
      getters: {

    },
    actions: {
      getOrderDetailById
    }
  },
  methods: {

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

  .orders-product-img img {
    width: 100%;
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
    margin-bottom: 12px;
    padding-right: 10px;
    overflow : hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
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
    padding-left: 10px;
    font-size: 14px;
  }


</style>
