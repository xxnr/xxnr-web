<template>
  <div class="my_point--section">
    <img class="my_points--logo" src="/assets/images/points_coins_icon.png" alt="">
    <div class="points_text">
      <span class="ponit_wording">当前积分</span> <span class="points">{{point}}</span>
    </div>
  </div>
</template>

<script>
  import ordersList from '../ordersList.vue'
  import { getOrders,getUserInfo,showBackBtn,hideRightBtn,editTitle } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        user : state => state.auth.user,
        point: state => state.auth.userInfo.pointLaterTrade
      },
      actions:{
        getOrders,
        getUserInfo,
        showBackBtn,
        hideRightBtn,
        editTitle
      }
    },
    components:{
    },
    route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('我的积分');
      }
    },
  }
</script>

<style scoped>
  .my_points--logo{
    padding-top: 45px;
    padding-bottom: 30px;
    margin: 0 auto;
    display: block;
  }
  .points_text{
    text-align: center;
    vertical-align: middle;
  }
  .points{
    padding-left: 15px;
    font-size: 24px;
    color: #FE9B00;
    height: 38px;
    line-height: 38px;
    display: inline-block;
    vertical-align: bottom;
  }
  .ponit_wording{
    height: 40px;
    line-height: 44px;
    display: inline-block;
    vertical-align: top;
  }
</style>
