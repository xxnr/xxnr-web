<template>
  <div class="my_orders--section">
    <div class="orders-tabs">
      <div class="orders-tab" @click="selectTab(0)"><span :class="{'currentTab': selectedTab == 0 }">全部</span></div>
      <div class="orders-tab" @click="selectTab(1)"><span :class="{'currentTab': selectedTab == 1 }">待付款</span></div>
      <div class="orders-tab" @click="selectTab(2)"><span :class="{'currentTab': selectedTab == 2 }">待发货</span></div>
      <div class="orders-tab" @click="selectTab(3)"><span :class="{'currentTab': selectedTab == 3 }">待收货</span></div>
      <div class="orders-tab" @click="selectTab(4)"><span :class="{'currentTab': selectedTab == 4 }">已完成</span></div>
    </div>
    <div class="orders-list">
      <orders-list :orders="orders"></orders-list>
    </div>

  </div>

</template>

<script>
  import ordersList from '../ordersList.vue'
  import { getOrders,showBackBtn } from '../../vuex/actions'

  export default {
    data: function () {
      return {
        selectedTab:0
      }
    },
    methods: {
      selectTab:function(num){
        if(num==0){
          this.getOrders();
        }else{
          this.getOrders(num);
        }
        this.selectedTab=num;
      }
    },
    vuex:{
      getters:{
        orders: state => state.myOrders.ordersList
      },
      actions:{
        getOrders,
        showBackBtn
      }
    },
    components:{
      ordersList
    },
    created(){
      this.getOrders(null);
      this.showBackBtn();
    },
    route: {
      deactivate (transition) {
        //when back to /home hide the backBtn
        if (transition.to.path === '/home') {
          this.changeRightBtnMyXXNR();
          this.changeRightBtnPathMyxxnr();
        }
        transition.next()
      },
      activate(){
        this.showBackBtn();
      }
    },
  }
</script>

<style>
  .orders-tabs{
    width: 100%;
    padding: 10px 0px;
    height: 45px;
    line-height: 45px;
    position: fixed;
    background: #FAFAFA;
    z-index: 1;
  }
  .orders-tab{
    border-top: 1px solid #c7c7c7;
    border-bottom: 1px solid #c7c7c7;
    float: left;
    display: inline-block;
    width: 20%;
    text-align: center;
    background: #FFFFFF;
  }
  .orders-tab span.currentTab{
    height: 45px;
    display: inline-block;
    border-bottom: 2px solid #00B38A;
    box-sizing: border-box;
  }
  .orders-list{
    padding-top: 85px;
  }
</style>
