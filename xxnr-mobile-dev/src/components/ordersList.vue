<template>
  <div class="ordersProductsRows clearfix">
    <div class="orderRow" v-for="order in orders">
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
      <div class="action-box">

      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['orders']
  }
</script>

<style scoped>
  .ordersProductsRows{
    background: #FAFAFA;
  }
  .orderRow{
    margin-bottom: 20px;
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
    height: 50px;
    overflow: hidden;
    margin-bottom: 12px;
    padding-right: 10px;
  }
  .orders-product-count{
    font-size: 20px;
  }
</style>
