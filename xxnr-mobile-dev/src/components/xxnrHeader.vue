<template>
  <div class="mobile-header">
    {{headerTitle}}
    <div class="header-bit header-back" @click="goBack()" v-if="backButtonDisplay"><img src="/assets/images/header_back_arrow.png" alt=""> </div>
    <div class="header-bit header-right" v-if="rightButton"><a @click="showBackBtn()" v-link="{ path: '/my_xxnr'}">{{rightButton}}</a></div>
  </div>
</template>

<script>
  import {showBackBtn,goBack} from '../vuex/actions'
  export default {
    vuex: {
      getters: {
        headerTitle: state => state.header.headerTitle,
        rightButton: state => state.header.rightButton,
        backButtonDisplay: state => state.header.backButtonDisplay
      },
      actions: {
        showBackBtn,goBack
      }
    }
  }
</script>

<style>
  .mobile-header {
    background-color: #00CC99;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #fff;
    /*font-weight: bold;*/
    position: fixed;
    width: 100%;
    z-index: 100;
  }
  .header-bit {
    position: absolute;
    top: 0;
    height: 30px;
    line-height: 30px;
  }
  .header-back {
    left: 2%;
  }
  .header-back img{
    height: 20px;
    padding-top: 6px;
  }
  .header-right {
    right: 2%;
  }
</style>
