<template>
  <div class="order-done-img">
    <img src="/assets/images/gift_order_success.png">
  </div>
  <div class="order-done-tip1">
    兑换码: <span class="order-done-code">{{giftOrderDetail.deliveryCode}}</span> 请凭兑换码到网点字体
  </div>
  <div class="order-done-tip2">
    您也可在 我的新农人->积分商城->兑换记录 中查看
  </div>
  <div class="order-done-btn" v-link="{path: '/pointsLogs/unComplete'}">
    查看兑换记录
  </div>
</template>

<script>
  import { showBackBtn,hideRightBtn,editTitle,getGiftOrderDetail } from '../../vuex/actions'
  import {getUrlParam} from '../../utils/common'
  import orderAddress from '../orderAddress.vue'

  export default {
    data: function () {
      return {
        toastShow: false
      }
    },
    vuex: {
      getters: {
        toastMsg: state => state.toastMsg,
        giftOrderDetail: state => state.giftOrder.giftOrderDetail
      },
      actions: {
        showBackBtn,
        hideRightBtn,
        editTitle,
        getGiftOrderDetail
      }
    }, route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('兑换成功');
        this.getGiftOrderDetail(getUrlParam('id'));
      }
    }
  }
</script>

<style scoped>
  .order-done-img {
    text-align: center;
    margin-top: 100px;
  }

  .order-done-img img {
    width: 40%;
  }

  .order-done-code {
    color: #00b38a;
  }

  .order-done-tip1 {
    font-size: 16px;
    line-height: 30px;
    margin-top: 50px;
    text-align: center;
  }

  .order-done-tip2 {
    font-size: 12px;
    text-align: center;
    line-height: 30px;
  }

  .order-done-btn {
    width: 130px;
    height: 34px;
    line-height: 34px;
    text-align: center;
    background-color: #FE9B00;
    color: #fff;
    font-size: 15px;
    border-radius: 3px;
    margin: 30px auto 0;
  }

  .order-done-btn:active {
    background-color: #FEC366;
  }
</style>
