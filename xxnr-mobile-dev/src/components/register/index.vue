<template>
  <div class="register-section">
    <div class="register-input phone-input">
      <img src="/assets/images/my_xxnr_user.png" alt="">
      <input v-model="phoneNum" type="text" placeholder="请输入手机号">
    </div>
    <div class="register-input code-input">
      <img src="/assets/images/my_xxnr_sms.png" alt="">
      <input v-model="code" type="text" placeholder="请输入验证码">
      <button :disabled="forbidSendCode" @click="sendRegisterCode(phoneNum),showToast()"  class="send-code">
        获取验证码
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
      <input v-model="policyChecked" type="checkbox"><span>我已阅读并同意《新新农人用户协议》</span>
    </div>
    <button class="register-btn" @click="register(phoneNum,password,code)">
      注册
    </button>
  </div>
  <div v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>

<script>
  import { sendRegisterCode,register,showBackBtn,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr } from '../../vuex/actions'
  import xxnrToast from '../../xxnr_mobile_ui/xxnrToast.vue'

  export default {
    data: function () {
      return {
        toastShow:false,
        policyChecked:true
      }
    },
    methods: {
      showToast:function(){
        this.toastShow=true;
      }
    },
    vuex:{
      getters:{
        toastMsg: state => state.toastMsg,
        forbidSendCode: state => state.register.forbidSendCode
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
      xxnrToast
    },
    created () {
      this.showBackBtn()
    },
    route: {
      activate(){
        this.showBackBtn();
      }
    },
  }
</script>

<style scoped>
  .register-section{
    padding: 80px 40px;
  }
  .register-input{
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #c0c0c0;
    margin-bottom: 10px;
  }
  .register-input input{
    padding-left: 25px;
    font-size: 14px;
  }
  .register-input img{
    height: 22px;
    width: 20px;
    margin-top: 10px;
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
  }
  .user-agreement input{
    float: left;
    margin-top: 5px;
  }
  .user-agreement span{
    float: left;
    margin-top: 2px;
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
    padding: 0 3px;
  }
</style>
