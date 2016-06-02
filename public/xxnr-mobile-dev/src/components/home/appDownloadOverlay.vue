<template>
  <div v-show="showAppDownload" class="index-appDownload">
    <img @click="closeAppDownload()" class="shut_down" src="/assets/images/download_shut_down.png" alt="">
    <img class="xxnr_logo" src="/assets/images/xxnr_logo.png" alt="">
    <p class="overlay-wording">下载客户端，注册享好礼! </p>
    <div class="downloadBtn">
      立即下载
    </div>
  </div>
  <div v-show="showAppDownload" class="appDownload-overlay">
  </div>
</template>

<script>
  import { closeAppDownload } from '../../vuex/actions'
  export default {
    vuex: {
      getters: {
        showAppDownload: state => state.showAppDownload
      },
      actions: {
        closeAppDownload
      }
    }
  }
</script>

<style>
  .index-appDownload {
    height: 60px;
    text-align: center;
    color: #FFFFFF;
    /*font-weight: bold;*/
    position: fixed;
    width: 100%;
    bottom: 0px;
    z-index: 100;
  }
  .appDownload-overlay{
    position: fixed;
    height: 60px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 50;
    bottom: 0px;
  }
  .shut_down{
    position: absolute;
    top: 8px;
    left: 10px;
    z-index: 100;
    height: 10px;
    width: 10px;
  }
  .xxnr_logo{
    position: absolute;
    top: 12px;
    left: 30px;
    z-index: 1000;
    width: 34px;
    height: 34px;
  }
  .overlay-wording{
    line-height: 60px;
    font-size: 15px;
  }
  .downloadBtn{
    position: absolute;
    width:64px;
    height: 27px;
    background: #FE9B00;
    color: #FFFFFF;
    font-size: 13px;
    top: 16px;
    right: 6px;
    line-height: 27px;
    border-radius: 5px;
  }
</style>
