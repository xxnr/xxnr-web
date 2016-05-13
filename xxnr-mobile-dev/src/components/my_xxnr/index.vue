<template>
  <div v-if="!userInfo" class="profile_section--noUser ">
    <img class="avatar" src="" alt="">
    <button  v-link="{ path: '/login'}" class="login_btn">登录</button>
    <button v-link="{ path: '/register'}" class="register_btn">注册</button>
  </div>
  <div v-else class="profile_section--hasUser">
    <img class="left-avatar" src="" alt="">
    <div class="profile_section--TextInfo">
      <p>{{userInfo.nickname}}</p>
      <p>所在地区：
      <span v-for="part in userInfo.address">
        {{part.name}}
      </span>
      </p>
      <p>
        类型：{{userInfo.userTypeInName}}
      </p>
    </div>
  </div>

  <div class="profile_options">
    <div class="profile_option" v-link="userInfo?{ name: 'myOrders'}:{ name: 'login'}" >
      <img class="option_icon" src="/assets/images/my_xxnr_icon_order.png" alt="">我的订单
      <span class="span-right">
        查看全部订单
      </span>
    </div>
    <div class="profile_option">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_point.png" alt="">我的积分
    </div>
    <div class="profile_option">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_peasant.png" alt="">新农代表
    </div>
    <div class="profile_option">
      <a href="tel:400-056-0371">
        <img class="option_icon" src="/assets/images/my_xxnr_icon_service_telephone.png" alt="">客服电话
        <span id="phone_number">400-056-0371</span>
      </a>

    </div>
    <div @click="logout()" v-cloak v-if="userInfo" class="profile_option">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_out.png" alt="">退出登录
    </div>
  </div>
</template>

<script>
  import {
    hideBackBtn,
    showBackBtn,
    changeRightBtnHome,
    changeRightBtnMyXXNR,
    changeRightBtnPathMyxxnr,
    getCookieUser,
    getUserInfo,
    logout
  } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        user : state => state.auth.user,
        userInfo : state => state.auth.userInfo
      },
      actions:{
        hideBackBtn,
        showBackBtn,
        changeRightBtnHome,
        changeRightBtnMyXXNR,
        changeRightBtnPathMyxxnr,
        getCookieUser,
        getUserInfo,
        logout
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
          this.changeRightBtnPathMyxxnr();
        }
        transition.next()
      },
      activate(){
        this.getUserInfo(this.user.userId);
      }
    },
    created () {
      this.changeRightBtnHome();
      this.getCookieUser();
      this.getUserInfo(this.user.userId);
    }
  }
</script>

<style>
  .profile_section--noUser{
    height: 160px;
    text-align: center;
    background: url('../../../static/assets/images/profile_background.png') center center no-repeat;
    background-size: cover;

  }
  .profile_section--hasUser{
    text-align: left;
    height: 160px;
    background: url('../../../static/assets/images/profile_background.png') center center no-repeat;
    color: #FFFFFF;
    background-size: cover;
  }
  .profile_section--TextInfo{
    display: inline-block;
    padding-top: 45px;
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
  .left-avatar{
    /*display: block;*/
    /*margin: 0px auto;*/
    padding: 40px 0;
    padding-left: 20px;
    height: 70px;
    width: 70px;
    /*margin-top: 42px ;*/
    border-radius: 50%;
  }
  .profile_section--noUser button{
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
  .span-right{
    float: right;
  }
</style>
