<template>
  <div class="my_orders--section">
    <div class="orders-tabs">
      <div class="orders-tab"  v-link="{ path: '/my_orders/myAllOrders'}" ><span :class="{'currentTab': selectedTab == 0 }">全部</span></div>
      <div class="orders-tab"  v-link="{ path: '/my_orders/myPayingOrders'}" ><span :class="{'currentTab': selectedTab == 1 }">待付款</span></div>
      <div class="orders-tab"  v-link="{ path: '/my_orders/myDeliveringOrders'}" ><span :class="{'currentTab': selectedTab == 2 }">待发货</span></div>
      <div class="orders-tab"  v-link="{ path: '/my_orders/myConfirmingOrders'}" ><span :class="{'currentTab': selectedTab == 3 }">待收货</span></div>
      <div class="orders-tab"  v-link="{ path: '/my_orders/myCompletedOrders'}" ><span :class="{'currentTab': selectedTab == 4 }">已完成</span></div>
    </div>
  </div>
  <router-view></router-view>
  <pop-box></pop-box>
</template>

<script>
  import popBox from '../popBox.vue'
  import { showBackBtn, changeRightBtnMyXXNR,hideRightBtn,editTitle } from '../../vuex/actions'

  export default {
    data: function () {
      return {
        selectedTab:0
      }
    },
    components: {
      popBox
    },
    methods: {
    },
    vuex:{
      getters:{

      },
      actions:{
        hideRightBtn,
        showBackBtn,
        changeRightBtnMyXXNR,
        editTitle
      }
    },

    created(){
      this.showBackBtn();
    },
    route: {
      activate(){
        this.hideRightBtn();
        this.showBackBtn();
        this.selectedTab = 0;
        this.editTitle('我的订单');
      }
    }
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
    padding-top: 65px;
  }
</style>
