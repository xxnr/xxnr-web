<template>
  <div class="verify-code-box" v-show="isShowBox">
    <div class="verify-code-title">安全验证</div>
    <div class="verify-code-con">
      <input type="text" class="verify-code" placeholder="请输入图形验证码" maxlength="4" v-model="captcha">
      <div class="reset-captche" v-if="captcha.length > 0">
        <img src="/assets/images/delete.png" @click="resetCaptcha();">
      </div>

      <div class="verify-code-img-normal" v-if="isNormal" @click="refreshCode(phoneNum),resetCaptcha();">
        <img :src="codeImg" onerror="javascript:this.src='/static/assets/images/load-failed.png';this.onerror = null;">
      </div>
      <!--<div class="verify-code-img-error">-->
        <!--<img src="/assets/images/load-failed.png">-->
      <!--</div>-->
      <div class="verify-code-img-loading" v-if="isLoading">
        <img src="/assets/images/spinner_gray.png">
      </div>
      <div class="verify-code-refresh" @click="refreshCode(phoneNum),resetCaptcha();">
        <img src="/assets/images/refresh.png">
      </div>
    </div>
    <div class="verify-code-tips" v-if="hasCodeTips">
      <img src="/assets/images/error.png"><span>{{codeTips}}</span>
    </div>
    <div class="verify-code-btn-box">
      <div class="verify-code-btn left-btn" @click="hideCodeBox(),resetCaptcha();">取消</div>
      <div class="verify-code-btn right-btn" @click="verifyCaptcha(phoneNum, captcha),showToast(),resetCaptcha();">确定</div>
    </div>
  </div>
  <div class="mask" v-show="isShowBox" @click="hideCodeBox();"></div>
  <div v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>
<script>
import xxnrToast from '../xxnr_mobile_ui/xxnrToast.vue'
import {hideCodeBox, showCodeBox, refreshCode, verifyCaptcha } from '../vuex/actions'
export default {
  props: ['phone-num'],
  data: function(){
    return {
      toastShow:false,
      captcha: ''
    }
  },
  vuex: {
    getters: {
      isShowBox: state => state.register.isShowBox,
      codeImg: state => state.register.codeImg,
      isNormal: state => state.register.isNormal,
      isLoading: state => state.register.isLoading,
      hasCodeTips: state => state.register.hasCodeTips,
      toastMsg: state => state.toastMsg,
      codeTips: state => state.register.codeTips
    },
    actions: {
      hideCodeBox,
      refreshCode,
      verifyCaptcha,
    }
  },
  components: {
    xxnrToast
  },
  methods: {
    resetCaptcha() {
      this.captcha = '';
    },
    showToast:function(){
      this.toastShow=true;
    }
  },
  detached(){
    console.log('detached');
    this.resetCaptcha();
  }
}

</script>

<style scoped>
  .verify-code-box {
    position: fixed;
    z-index: 1000;
    background-color: #fff;
    width: 300px;
    height: 180px;
    top: 50%;
    margin-top: -90px;
    left: 50%;
    margin-left: -150px;
    border-radius: 10px;
    overflow: hidden;
  }

  .verify-code-title {
    line-height: 48px;
    text-align: center;
    color: #323232;
    font-size: 18px;
  }

  .verify-code-con {
    height: 34px;
    width: 260px;
    margin: 0 auto;
    position: relative;
    margin-top: 13px;
  }

  .verify-code {
    width: 123px;
    height: 34px;
    position: absolute;
    top: 0;
    left: 0;
    border: 1px solid #EFEFEF;
    box-sizing: border-box;
    padding-left: 7px;
  }

  .verify-code-img-error, .verify-code-img-loading, .verify-code-img-normal {
    width: 100px;
    height: 34px;
    position: absolute;
    left: 130px;
    border: 1px solid #E5EAEC;
    overflow: hidden;
    box-sizing: border-box;
  }

  .verify-code-refresh {
    position: absolute;
    right: 0;
    width: 20px;
    top: 7px;
  }

  .verify-code-refresh img {
    width: 100%;
  }

  .verify-code-btn-box {
    position: absolute;
    width: 100%;
    height: 50px;
    bottom: 0;
    line-height: 50px;
    border-top: 1px solid #e2e2e2;
  }

  .verify-code-btn {
    position: absolute;
    width: 50%;
    box-sizing: border-box;
    color: #00b38a;
    font-size: 18px;
    text-align: center;
  }

  .left-btn {
    left: 0;
    border-right: 1px solid #eaeaea;
  }

  .right-btn {
    right: 0;
  }

  .verify-code-img-normal img, .verify-code-img-error img{
    width: 100%;
    height: auto;
  }

  .verify-code-img-loading img{
    width: 20px;
    vertical-align: middle;
  }

  .verify-code-img-loading {
    text-align: center;
    line-height: 34px;
  }

  .reset-captche {
    position: absolute;
    width: 15px;
    top: 10px;
    left: 100px;
  }

  .reset-captche img {
    width: 100%;
  }

  .verify-code-tips {
    color: #df3d3e;
    font-size: 12px;
    padding-left: 7px;
    margin-top: 7px;
    margin-bottom: 13px;
    line-height: 15px;
    margin-left: 20px;
  }

  .verify-code-tips img {
    width: 15px;
    margin-right: 7px;
  }
</style>
