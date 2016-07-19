<template>
  <div class="my-invitation-section" v-if="!userInfo.inviter">
    <div class="my-invitation-logo">
      <img src="/assets/images/invitation_icon.png" alt="">
    </div>
    <div v-else class="addInviter clearfix">
      <input type="text" v-model="inviterPhone" placeholder="输入代表人手机号进行添加">
      <button class="xxnr_Btn" @click="bindInviterMethod()">
        添加
      </button>
    </div>
    <div class="addInviter-tips">
      <span class="addInviter-tips-orange">*</span>代表人添加后不可修改，请仔细核对
    </div>
  </div>
  <div class="my-invitation-section" v-if="userInfo.inviter">
    <div class="my-invitation-img">
      <img v-if="!inviterInfo.inviterPhoto" src="/assets/images/invitation_icon.png" alt="">
      <img v-if="inviterInfo.inviterPhoto" :src="inviterInfo.inviterPhoto">
    </div>
    <div class="inviter-nickname">
      <span v-if="inviterInfo.inviterName">{{inviterInfo.inviterName}}</span><span v-else>新新农人</span>&nbsp;&nbsp;<span class="nickname-bit" v-if="inviterInfo.inviterSex"><img src="/assets/images/female.png"></span><span class="nickname-bit" v-else><img src="/assets/images/male.png"></span>
    </div>
    <!--<div class="inviter-name" v-if="userInfo.inviter">-->
      <!--{{userInfo.inviter}}-->
    <!--</div>-->
    <div class="inviter-info">
      用户类型:&nbsp;&nbsp;{{inviterInfo.inviterUserTypeInName}}&nbsp;&nbsp;<img src="/assets/images/verified-icon.png" v-if="inviterInfo.inviterIsVerified">
    </div>
    <div class="inviter-info" v-if="userInfo.inviterAddress">
      所在地区:&nbsp;&nbsp;{{inviterInfo.inviterAddress.province.name}}&nbsp;{{userInfo.inviterAddress.city.name}}&nbsp;{{userInfo.inviterAddress.county.name}}&nbsp;{{userInfo.inviterAddress.town.name}}
    </div>
    <div class="inviter-info">
      电话号码:&nbsp;&nbsp;{{inviterInfo.inviterPhone}}&nbsp;<img src="/assets/images/tel.png" @click="showConfirmBoxTel();">
    </div>
  </div>
  <div class="mask" v-if="showConfirm"></div>
  <div class="confirm-box" v-if="showConfirm">
    <div class="confirm-box-wor">确定设置该用户为您的代表吗？</div>
    <div class="confirm-btn-box">
      <div class="confirm-btn confirm-cancel" @click="hideConfirmBox();">
        取消
      </div>
      <div class="confirm-btn confirm-confirm" @click="bindInviter(inviterPhone),hideConfirmBox(),showToast();">
        确定
      </div>
    </div>
  </div>
  <div class="mask" v-if="showConfirmTel"></div>
  <div class="confirm-box" v-if="showConfirmTel">
    <div class="confirm-box-wor">{{inviterInfo.inviterPhone}}</div>
    <div class="confirm-btn-box">
      <div class="confirm-btn confirm-cancel" @click="hideConfirmBoxTel();">
        取消
      </div>
      <a href="tel:{{inviterInfo.inviterPhone}}">
        <div class="confirm-btn confirm-confirm" @click="hideConfirmBoxTel();">
          拨打
        </div>
      </a>
    </div>
  </div>
  <div class="toast-container" v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>

<script>
  import { bindInviter,getUserInfo,showBackBtn,hideRightBtn,getInviter,clearInviter} from '../../vuex/actions'
  import xxnrToast from '../../xxnr_mobile_ui/xxnrToast.vue'

  export default {
    data(){
      return {
        showConfirm: false,
        showConfirmTel: false,
        toastShow:false,
        inviterPhone: ''
      }
    },
    vuex:{
      getters:{
        user : state => state.auth.user,
        userInfo : state => state.auth.userInfo,
        inviterInfo: state => state.auth.inviterInfo,
        toastMsg: state => state.toastMsg
      },
      actions:{
        bindInviter,
        getUserInfo,
        showBackBtn,
        hideRightBtn,
        getInviter,
        clearInviter
      }
    },
    components:{
      xxnrToast
    },
    methods: {
      bindInviterMethod: function() {
        var reg = /^1\d{10}$/;
        if(!this.inviterPhone || !reg.test(this.inviterPhone)) {
          this.bindInviter(this.inviterPhone);
          this.showToast();
        } else {
          this.showConfirm =  true;
          //this.bindInviter(inviterPhone);
        }
      },
      showConfirmBox:function (inviterPhone) {
          this.showConfirm =  true;
      },
      hideConfirmBox:function () {
        this.showConfirm = false;
      },
      showConfirmBoxTel:function () {
        this.showConfirmTel =  true;
      },
      hideConfirmBoxTel:function () {
        this.showConfirmTel = false;
      },
      showToast:function(){
        this.toastShow=true;
      }
    },
    created () {

    },
    detached(){
      this.inviterPhone = '';
    },
    route: {
      activate(){
        this.getInviter(this.user.userId);
        this.showBackBtn();
        this.hideRightBtn();
      },
      deactivate() {
        this.clearInviter();
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

  .my-invitation-logo img {
    width: 100%;
  }

  .my-invitation-img{
    margin: 40px auto 14px;
    height: 70px;
    width: 70px;
    border-radius: 50%;
    overflow: hidden;
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
    outline: none;
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

  .confirm-box {
    position: fixed;
    width: 240px;
    height: 110px;
    left: 50%;
    top: 50%;
    margin-top: -55px;
    margin-left: -120px;
    background-color: #fff;
    z-index: 100;
    border-radius: 5px;
    overflow: hidden;
  }

  .confirm-box-wor {
    line-height: 60px;
    height: 60px;
    overflow: hidden;
    text-align: center;
  }

  .confirm-btn {
    position: absolute;
    width: 50%;
    box-sizing: border-box;
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: #14B892;
    border-top: 1px solid #eee;
  }

  .confirm-cancel {
    left: 0;
    border-right: 1px solid #eee;
  }

  .confirm-confirm {
    right: 0;
  }

  .addInviter input[type=text] {
    float: left;
    width: 75%;
    font-size: 16px;
    box-sizing: border-box;
    border: 1px solid #C7C7C7;
    border-radius: 5px;
    color: #B0B0B0;
    height: 35px;
    padding-left: 10px;
    -webkit-appearance: none;
  }
</style>
