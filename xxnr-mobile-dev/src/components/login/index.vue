<template>
  <div class="login-section">
    <div class="login-input phone-input">
      <img src="" alt="">
      <input v-model="phoneNum" type="text" placeholder="请输入手机号">
    </div>
    <div class="login-input password-input">
      <img src="" alt="">
      <input v-model="password" type="text" placeholder="请输入密码">
    </div>
    <div class="forget-pass">
      忘记密码？
    </div>
    <button class="login-btn" @click="login(phoneNum,password)">
      确认登录
    </button>
    <div class="reg-section">
      还没有帐号？<a href="">立即注册</a>
    </div>
  </div>
</template>

<script>
  import { login } from '../../vuex/actions'

  export default {
    vuex:{
      getters:{
      },
      actions:{
        login
      },
    },
    created () {
    }
  }
</script>

<style>
  .login-section{
    padding: 80px 40px;
  }
  .login-input{
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #c0c0c0;
    margin-bottom: 10px;
  }
  .login-input input{
    padding-left: 25px;
    font-size: 15px;
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
</style>
