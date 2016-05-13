<template>
  <div class="ordersProductsRows clearfix">
    <div class="ordersProductsRow" v-for="order in orders">
      <div v-for="SKU in order.SKUs">
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

<style>
  .ordersProductsRow{
    margin-bottom: 20px;
  }
  .orders-product-img{
    height: 90px;
    width: 90px;
    border:1px solid #c7c7c7;
    display: inline-block;
  }
  .orders-product-info{
    display: inline-block;
    position: absolute;
    left: 100px;
  }
  .orders-product-name{
    height: 50px;
    overflow: hidden;
    margin-bottom: 15px;
  }
</style>
