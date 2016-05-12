<template>
  <div class="profile_section">
    <img class="avatar" src="" alt="">
    <button  v-link="{ path: '/login'}" class="login_btn">登录</button>
    <button v-link="{ path: '/register'}" class="register_btn">注册</button>
  </div>
  <div class="profile_options">
    <div class="profile_option" v-link="{ name: 'myAllOrders'}" >
      <img class="option_icon" src="/assets/images/my_xxnr_icon_order.png" alt="">我的订单
    </div>
    <div class="profile_option">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_point.png" alt="">我的积分
    </div>
    <div class="profile_option">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_peasant.png" alt="">新农代表
    </div>
    <div class="profile_option">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_service_telephone.png" alt="">客服电话
      <span id="phone_number">400-056-0371</span>
    </div>
  </div>
</template>

<script>
  import { hideBackBtn,showBackBtn,changeRightBtnHome,changeRightBtnMyXXNR } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
      },
      actions:{
        hideBackBtn,showBackBtn,changeRightBtnHome,changeRightBtnMyXXNR
      }
    },
    components: {
    },
    route: {
      deactivate (transition) {
        //when back to /home hide the backBtn
        if (transition.to.path === '/home') {
          this.hideBackBtn();
          this.changeRightBtnMyXXNR();
        }
        transition.next()
      }
    },
    created () {
      this.changeRightBtnHome();
    }
  }
</script>

<style>
  .profile_section{
    height: 160px;
    text-align: center;
    background: url('../../../static/assets/images/profile_background.png') center center no-repeat;
    background-size: cover;
  }
  .avatar{
    display: block;
    margin: 0px auto;
    padding: 21px 0;
    height: 70px;
    width: 70px;
    /*margin-top: 42px ;*/
    border-radius: 50%;
  }
  .profile_section button{
    color: #FFFFFF;
    height: 24px;
    width: 68px;
    border: 1px solid #FFFFFF;
    background: none;
    border-radius: 5px;
  }
  .profile_option{
    height: 48px;
    line-height: 48px;
    color: #323232;
    margin: 0 12px;
    border-bottom: 1px solid #909090;
  }
  .profile_option img{
    width: 27px;
    height: 27px;
    padding-top: 10px;
    padding-right: 10px;
  }
  #phone_number{
    color: #00B38A;
    float: right;

  }
</style>
