<template>
  <div class="register-section">
    <div class="register-input phone-input">
      <img src="" alt="">
      <input v-model="phoneNum" type="text" placeholder="请输入手机号">
    </div>
    <div class="register-input code-input">
      <img src="" alt="">
      <input v-model="password" type="text" placeholder="请输入验证码">
      <button class="send-code">
        获取验证码
      </button>
    </div>
    <div class="register-input pass-input">
      <img src="" alt="">
      <input v-model="password" type="text" placeholder="请输入密码">
    </div>
    <div class="register-input pass-confirm-input">
      <img src="" alt="">
      <input v-model="password" type="text" placeholder="请输入您的确认密码">
    </div>
    <div class="user-agreement clearfix">
      <input type="checkbox"><span>我已阅读并同意《新新农人用户协议》</span>
    </div>
    <button class="register-btn" @click="login(phoneNum,password)">
      注册
    </button>
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
  .send-code{
    background: #FFFFFF;
    color: #00B38A;
    text-align: center;
    box-shadow:none !important;
    border:1px solid #00B38A;
    border-radius: 4px;

  }
</style>
