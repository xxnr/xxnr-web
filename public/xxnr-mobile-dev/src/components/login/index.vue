<template>
  <div class="login-section">
    <div class="login-input phone-input">
      <img src="/assets/images/my_xxnr_user.png" alt="">
      <input v-model="phoneNum" type="text" placeholder="请输入手机号">
    </div>
    <div class="login-input password-input">
      <img src="/assets/images/my_xxnr_password.png" alt="">
      <input v-model="password" type="text" placeholder="请输入密码" onfocus="this.type='password'" autocomplete="off">
    </div>
    <!--<div class="forget-pass">-->
      <!--忘记密码？-->
    <!--</div>-->
    <button class="login-btn" @click="login(phoneNum,password),showToast()">
      确认登录
    </button>
    <div class="reg-section">
      还没有帐号？<a href="" v-link="{ path: '/register'}" class="reg-section-green">立即注册</a>
    </div>
  </div>
  <div v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>

<script>
  import { login,showBackBtn,hideRightBtn } from '../../vuex/actions'
  import xxnrToast from '../../xxnr_mobile_ui/xxnrToast.vue'

  export default {
    data: function () {
      return {
        toastShow:false
      }
    },
    methods: {
      showToast:function(){
        this.toastShow=true;
      }
    },
    vuex:{
      getters:{
        toastMsg: state => state.toastMsg
      },
      actions:{
        login,
        showBackBtn,
        hideRightBtn
      },
    },
    components: {
      xxnrToast
    },
    detached () {
      this.password = '';
    },
    route: {
      activate(){
        this.hideRightBtn();
        this.showBackBtn();
      }
    },
  }
</script>

<style>
  .login-section{
    padding: 80px 40px;
  }
  .login-input{
    position: relative;
    height: 40px;
    line-height: 40px;
    margin-bottom: 10px;
  }
  .login-input input{
    padding-left: 25px;
    font-size: 15px;
  }
  .login-input img{
    position: absolute;
    height: 22px;
    width: 17px;
    margin-top: 10px;
    top: 0;
  }
  .forget-pass{
    text-align: right;
  }
  .login-btn{
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
  .reg-section{
    margin-top: 30px;
    text-align: center;
  }

  .reg-section-green {
    color: #00B38A;
  }

  .login-input input[type=text] {
    padding-left: 47px;
    font-size: 15px;
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    border-bottom: 1px solid #c0c0c0;
  }

  .login-input input[type=password] {
    padding-left: 47px;
    font-size: 15px;
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    border-bottom: 1px solid #c0c0c0;
  }
</style>
