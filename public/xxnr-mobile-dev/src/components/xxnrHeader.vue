<template>
  <div class="mobile-header">
    {{headerTitle}}
    <div class="header-bit header-back" @click="goBack()" v-if="backButtonDisplay"><img src="/assets/images/header_back_arrow.png" alt=""> </div>
    <div class="header-bit header-right" v-if="rightButtonDisplay">
      <a v-link="{path: '/' + rightButtonGoingPath}">
        <img :src="rightButton" alt="" v-if="!rightButtonText">
        <span v-if="rightButtonText">{{rightButtonText}}</span>
      </a>
    </div>
  </div>
</template>

<script>
  import {showBackBtn,goBack} from '../vuex/actions'
  export default {
    vuex: {
      getters: {
        headerTitle: state => state.header.headerTitle,
        rightButton: state => state.header.rightButton,
        backButtonDisplay: state => state.header.backButtonDisplay,
        rightButtonGoingPath:state => state.header.rightButtonGoingPath,
        rightButtonDisplay: state => state.header.rightButtonDisplay,
        rightButtonText: state => state.header.rightButtonText
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
    height: 44px;
    line-height: 44px;
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
    height: 44px;
    line-height: 44px;
  }
  .header-back {
    left: 2%;
  }
  .header-back img{
    height: 20px;
    margin-top: 12px;
  }
  .header-right {
    right: 2%;
  }
  .header-right img{
    width: 18px;
    margin-top: 13px;
  }

  .header-right a {
    color: #fff;
  }
</style>
