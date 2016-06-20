<template>
  <div class="my-invitation-section" v-if="!userInfo.inviter">
    <div class="my-invitation-logo">
      <img src="/assets/images/invitation_icon.png" alt="">
    </div>
    <div v-else class="addInviter clearfix">
      <input class="roundInput" type="text" v-model="inviterPhone" placeholder="输入代表人手机号进行添加">
      <button class="xxnr_Btn" @click="bindInviter(inviterPhone)">
        添加
      </button>
    </div>
    <div class="addInviter-tips">
      <span class="addInviter-tips-orange">*</span>代表人添加后不可修改，请仔细核对
    </div>
  </div>
  <div class="my-invitation-section" v-if="userInfo.inviter">
    <div class="my-invitation-img">
      <img src="/assets/images/invitation_icon.png" alt="">
    </div>
    <div class="inviter-nickname" v-if="userInfo.nickname">
      {{userInfo.nickname}}&nbsp;&nbsp;<span class="nickname-bit" v-if="userInfo.sex"><img src="/assets/images/female.png"></span><span class="nickname-bit" v-else><img src="/assets/images/male.png"></span>
    </div>
    <!--<div class="inviter-name" v-if="userInfo.inviter">-->
      <!--{{userInfo.inviter}}-->
    <!--</div>-->
    <div class="inviter-info">
      用户类型:&nbsp;&nbsp;{{userInfo.userTypeInName}}&nbsp;&nbsp;<img src="/assets/images/verified-icon.png" v-if="userInfo.isVerified">
    </div>
    <div class="inviter-info" v-if="userInfo.inviterAddress">
      所在地区:&nbsp;&nbsp;{{userInfo.inviterAddress.province.name}}&nbsp;{{userInfo.inviterAddress.city.name}}&nbsp;{{userInfo.inviterAddress.county.name}}&nbsp;{{userInfo.inviterAddress.town.name}}
    </div>
    <div class="inviter-info">
      电话号码:&nbsp;&nbsp;{{userInfo.phone}}&nbsp;<a href="tel:{{userInfo.phone}}"><img src="/assets/images/tel.png"></a>
    </div>
  </div>
</template>

<script>
  import { bindInviter,getUserInfo,showBackBtn,hideRightBtn } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
        user : state => state.auth.user,
        userInfo : state => state.auth.userInfo
      },
      actions:{
        bindInviter,
        getUserInfo,
        showBackBtn,
        hideRightBtn
      }
    },
    components:{
    },
    created () {
      this.getUserInfo(this.user.userId);
    },
    route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
      }
    },
  }
</script>

<style>
  .my-invitation-logo{
    margin: 105px auto 50px;
    height: 70px;
    width: 70px;
  }

  .my-invitation-img{
    margin: 40px auto 14px;
    height: 70px;
    width: 70px;
  }

  .my-invitation-img img {
    width: 100%;
  }
  .roundInput{
    float: left;
    width: 75%;
    font-size: 16px;
    box-sizing: border-box;
  }
  .hasInviter{
    text-align: center;
  }
  .addInviter .xxnr_Btn{
    float: left;
    height: 35px;
    width: 20%;
    margin-left: 5%;
  }
  .addInviter{
    text-align: center;
    width: 90%;
    margin: 0 auto;
  }

  .addInviter-tips {
    color: #727272;
    font-size: 12px;
    width: 90%;
    margin: 0 auto;
    padding-left: 10px;
    margin-top: 5px;
  }

  .addInviter-tips-orange {
    color: #ff9000;
    font-size: 18px;
  }

  .nickname-bit img {
    width: 18px;
    vertical-align: baseline;
  }

  .inviter-nickname {
    text-align: center;
    margin-bottom: 35px;
    font-size: 20px;
    color: #646464;
  }

  .inviter-info {
    margin: 0 8% 12px;
    line-height: 16px;
  }

  .inviter-info img {
    width: 12px;
  }
</style>
