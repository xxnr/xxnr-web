<template>
  <div class="my_orders--section">
    <div class="orders-tabs">
      <div class="orders-tab" @click="getOrders()" >全部</div>
      <div class="orders-tab" @click="getOrders(1)" >待付款</div>
      <div class="orders-tab" @click="getOrders(2)" >待发货</div>
      <div class="orders-tab" @click="getOrders(3)" >待收货</div>
      <div class="orders-tab" @click="getOrders(4)" >已完成</div>
    </div>
    <orders-list :orders="orders"></orders-list>
  </div>

</template>

<script>
  import ordersList from '../ordersList.vue'
  import { getOrders } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        orders: state => state.myOrders.ordersList
      },
      actions:{
        getOrders
      }
    },
    components:{
      ordersList
    },
    created(){
      this.getOrders(null)
    }
  }
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
