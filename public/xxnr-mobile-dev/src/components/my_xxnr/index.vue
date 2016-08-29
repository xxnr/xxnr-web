<template>
  <div v-if="!userInfo" class="profile_section--noUser ">
    <img class="avatar" src="/assets/images/myXXNR_default_avantar.png" alt="">
    <button  v-link="{ path: '/login'}" class="login_btn">登录</button>
    <button v-link="{ path: '/register'}" class="register_btn">注册</button>
  </div>
  <div v-else class="profile_section--hasUser">
    <div class="profile_section--avantar">
      <img v-if="userInfo.photo" class="left-avatar" :src="userInfo.photo" alt="">
      <img v-else class="left-avatar" src="/assets/images/myXXNR_default_avantar.png" alt="">
    </div>
    <div class="profile_section--TextInfo">
      <p v-if="userInfo.nickname">{{userInfo.nickname}}</p>
      <p v-else>新新农人</p>
      <p class="myxxnr--address">所在地区：
        <span v-if="userInfo.address">
          <span v-for="part in userInfo.address">
          {{part.name}}
          </span>
        </span>
        <span v-else>
          未设置
        </span>
      </p>
      <p class="myxxnr--type">
        类型：{{userInfo.userTypeInName}}&nbsp;&nbsp;<img src="/assets/images/verified-icon.png" v-if="userInfo.isVerified">
      </p>
    </div>
  </div>

  <div class="profile_options">
    <div class="profile_option" v-link="{ name: 'myOrders'}" >
      <img class="option_icon" src="/assets/images/my_xxnr_icon_order.png" alt="">我的订单
      <span class="span-right">
        查看全部订单
      </span>
    </div>
    <div class="profile_option" v-link="{ name: 'rewardShop'}">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_point.png" alt="">积分商城
    </div>
    <div class="profile_option" v-link="{ name: 'myInvitation'}">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_peasant.png" alt="">新农代表
    </div>
    <div class="profile_option" @click="showConfirmBox();">
      <!--<a href="tel:400-056-0371">-->
        <img class="option_icon" src="/assets/images/my_xxnr_icon_service_telephone.png" alt="">客服电话
        <span id="phone_number">400-056-0371</span>
      <!--</a>-->

    </div>
    <div @click="logout()" v-cloak v-if="userInfo" class="profile_option">
      <img class="option_icon" src="/assets/images/my_xxnr_icon_out.png" alt="">退出登录
    </div>
  </div>
  <div class="mask" v-if="showConfirm"></div>
  <div class="confirm-box" v-if="showConfirm">
    <div class="confirm-box-wor">400-056-0371</div>
    <div class="confirm-btn-box">
      <div class="confirm-btn confirm-cancel" @click="hideConfirmBox();">
        取消
      </div>
      <a href="tel:400-056-0371">
        <div class="confirm-btn confirm-confirm" @click="hideConfirmBox();">
          拨打
        </div>
      </a>
    </div>
  </div>
</template>

<script>
  import {
    hideBackBtn,
    showBackBtn,
    showRightBtn,
    changeRightBtnHome,
    changeRightBtnPathHome,
    getCookieUser,
    getUserInfo,
    logout,
    editTitle
  } from '../../vuex/actions'

  export default {
    data(){
      return {
        showConfirm: false
      }
    },
    vuex:{
      getters:{
        user : state => state.auth.user,
        userInfo : state => state.auth.userInfo
      },
      actions:{
        hideBackBtn,
        showBackBtn,
        showRightBtn,
        changeRightBtnHome,
        changeRightBtnPathHome,
        getCookieUser,
        getUserInfo,
        logout,
        editTitle
      }
    },
    components: {
    },
    methods: {
      showConfirmBox:function () {
        this.showConfirm =  true;
      },
      hideConfirmBox:function () {
        this.showConfirm = false;
      }
    },
    route: {
      activate(){
        this.getUserInfo(this.user.userId);
        this.showBackBtn();
        this.changeRightBtnHome();
        this.changeRightBtnPathHome();
        this.showRightBtn();
        this.editTitle('我的新农人');
      }
    },
    created () {
      this.getCookieUser();
      this.getUserInfo(this.user.userId);
    }
  }
</script>

<style scoped>
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
    padding-left: 12px;
    float: left;
    width: 65%;
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
    float: left;
    padding: 40px 0;
    margin-left: 20px;
    height: 70px;
    width: 70px;
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
    -webkit-tap-highlight-color: rgba(0,0,0,0);
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
  .myxxnr--address{
    font-size: 14px;
  }
  .myxxnr--type{
    font-size: 14px;
  }

  .myxxnr--type img {
    width: 10px;
    margin-top: 5px;
  }
</style>
