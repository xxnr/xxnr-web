<template>
  <div class="my_orders--section">
    <div class="orders-tabs">
      <div class="orders-tab" v-link="{ name: 'myAllOrders'}">全部</div>
      <div class="orders-tab" v-link="{ name: 'myNonPayment'}">待付款</div>
      <div class="orders-tab" v-link="{ name: 'myNonDeliver'}">待发货</div>
      <div class="orders-tab" v-link="{ name: 'mynNonReceiving'}">待收货</div>
      <div class="orders-tab" v-link="{ name: 'myCompleted'}">已完成</div>
    </div>
    <router-view>
    </router-view>
  </div>

</template>

<script>
//  import myOrder from './orderList.vue'
</script>

<style>
  .orders-tabs{
    height: 45px;
  }
  .orders-tab{
    float: left;
    display: inline-block;
    width: 20%;
    text-align: center;
  }
</style>
