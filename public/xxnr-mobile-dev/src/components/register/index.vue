<template>
  <div class="register-section">
    <div class="register-input phone-input">
      <img src="/assets/images/my_xxnr_user.png" alt="">
      <input v-model="phoneNum" type="text" placeholder="请输入手机号">
    </div>
    <div class="register-input code-input">
      <img src="/assets/images/my_xxnr_sms.png" alt="">
      <input v-model="code" type="text" placeholder="请输入验证码" style="width: 170px;">
      <button :disabled="forbidSendCode" @click="sendRegisterCode(phoneNum),showToast()"  class="send-code">
        发送验证码
      </button>
    </div>
    <div class="register-input pass-input">
      <img src="/assets/images/my_xxnr_password.png" alt="">
      <input v-model="password" type="password" placeholder="请输入密码">
    </div>
    <div class="register-input pass-confirm-input">
      <img src="/assets/images/my_xxnr_password.png" alt="">
      <input v-model="confirmPassword" type="password" placeholder="请输入您的确认密码">
    </div>
    <div class="user-agreement clearfix">
      <input v-model="policyChecked" type="checkbox">
      <div class="register-checkbox" :class="{checked:policyChecked}" @click="policyToggle();"></div>我已阅读并同意<span class="register-green"><a href="" v-link="{ path: '/userAgreement'}">《新新农人用户协议》</a></span>
    </div>
    <button class="register-btn" @click="register(phoneNum,password,code,confirmPassword,policyChecked),showToast()">
      注册
    </button>
  </div>
  <div class="reg-section">
    已有账号？<a href="" v-link="link" class="reg-section-green">登录</a>
  </div>
  <verify-code :phone-num="phoneNum"></verify-code>
  <div v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>

<script>
  import { sendRegisterCode,register,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr } from '../../vuex/actions'
  import xxnrToast from '../../xxnr_mobile_ui/xxnrToast.vue'
  import verifyCode from '../verifyCode.vue'
  import {getUrlParam} from '../../utils/common'

  export default {
    data: function () {
      return {
        toastShow:false,
        policyChecked:true,
        phoneNum: '',
        password: '',
        code: '',
        confirmPassword: '',
        link: getUrlParam('ref') ? {path: '/login?ref='+getUrlParam('ref')} : getUrlParam('redirect') ? {path: '/login?redirect='+getUrlParam('redirect')} : {path: '/login'}
      }
    },
    methods: {
      showToast:function(){
        this.toastShow=true;
      },
      policyToggle:function(){
        this.policyChecked = !this.policyChecked;
      }
    },
    vuex:{
      getters:{
        toastMsg: state => state.toastMsg,
        forbidSendCode: state => state.register.forbidSendCode,
        //phoneNum: state => state.register.phoneNum
      },
      actions:{
        sendRegisterCode,
        register,
        showBackBtn,
        changeRightBtnMyXXNR,
        changeRightBtnPathMyxxnr
      },
    },
    components: {
      xxnrToast,
      verifyCode
    },
    created () {
      this.showBackBtn()
    },
    detached() {
      this.policyChecked = true;
      this.phoneNum = '';
      this.password = '';
      this.code = '';
      this.confirmPassword = '';
    },
    route: {
      activate(){
        this.showBackBtn();
        this.link = getUrlParam('ref') ? {path: '/login?ref='+getUrlParam('ref')} : getUrlParam('redirect') ? {path: decodeURI('/login?redirect='+getUrlParam('redirect'))} : {path: '/login'};
      }
    },
  }
</script>

<style scoped>
  .register-checkbox {
    position: absolute;
    left: 0;
    top: 3px;
    width: 12px;
    height: 12px;
    background: url('../../../static/assets/images/register_checkbox.png') 0 0 no-repeat;
  }

  .register-checkbox.checked {
    background-position: 0 -12px;
  }

  .user-agreement input[type=checkbox] {
    position: absolute;
    opacity: 0;
    left: 0;
    top: 3px;
  }

  .register-section{
    width: 250px;
    margin: 0 auto;
    margin-top: 50px;
  }
  .register-input{
    height: 40px;
    line-height: 40px;
    margin-bottom: 10px;
    position: relative;
  }
  .register-input input{
    padding-left: 30px;
    font-size: 14px;
    border-bottom: 1px solid #c0c0c0;
    width: 100%;
    line-height: 14px;
    padding-bottom: 6px;
    box-sizing: border-box;
  }
  .register-input img{
    width: 18px;
    position: absolute;
    bottom: 8px;
  }
  .register-btn{
    margin-top: 50px;
    height: 44px;
    width: 100%;
    background: #00B38A;
    font-size: 18px;
    color: #FFFFFF;
    text-align: center;
    box-shadow:none !important;
    border:none !important;
    border-radius: 4px;
  }
  .user-agreement{
    font-size: 12px;
    position: relative;
    padding-left: 15px;
  }
  .code-input{
    position: relative;
  }
  .send-code{
    background: #FFFFFF;
    color: #00B38A;
    text-align: center;
    box-shadow:none !important;
    border:1px solid #00B38A;
    border-radius: 4px;
    position: absolute;
    right: 0px;
    top:12px;
    padding: 3px;
    outline: none;
    font-family: "微软雅黑";
  }

  .register-green a{
    color: #00b38a;
  }
</style>
