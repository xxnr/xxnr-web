<template>
  <div class="container" style="padding: 0">
    <app-download-overlay></app-download-overlay>
    <xxnr-swiper :list="slider" height="auto" auto></xxnr-swiper>
  </div>
  <div v-show="showCampaign">
    <xxnr-swipe :list="campaignsList" width="260px" height="355px" margin="20px" auto></xxnr-swipe>
  </div>
  <div class="campaign-icon" @click="showSwipe();">
    <img src="/assets/images/activity_icon.png">
  </div>
  <div class="swipe-mask" v-show="showCampaign"></div>
  <div class="swipe-mask-hide" @click="hideSwipe();" v-show="showCampaign">
    <img src="/assets/images/swipe_close.png">
  </div>
  <section-tabs></section-tabs>
  <div class="container">
    <div class="container">
      <div class="xxnr-title xxnr-title-car">
        汽车精选
        <div class="title-more"><a v-link="{ path: '/cars' }">更多商品&nbsp;></a></div>
      </div>
      <index-products-block-list :products="indexCars"></index-products-block-list>
      <div class="xxnr-title xxnr-title-huafei">
        化肥精选
        <div class="title-more"><a v-link="{ path: '/huafei' }">更多商品&nbsp;></a></div>
      </div>
      <index-products-block-list :products="indexHuafei"></index-products-block-list>
    </div>
  </div>
  <div class="container">
    <div class="clear"></div>
  </div>
  <div class="footer">
    <div class="container">
      <div class="footer-link">
        <a>移动版</a>
        <a @click="setCookie('mobile_use_www','true',(12/24),domain)" href="{{protocol}}//{{pcsubdomain}}{{domain}}">电脑版</a>
        <a href="http://a.app.qq.com/o/simple.jsp?pkgname=com.ksfc.newfarmer">客户端</a>
      </div>
      <div class="footer-tel">客服电话：400-056-0371</div>
      <div class="footer-company">北京新新农人网络科技有限公司</div>
      <div class="footer-ICP">京ICP备15037751</div>
    </div>
  </div>
  <div class="loader-img" v-if="showLoader">
    <img src="/assets/images/loading.png">
    <div class="loader-wor">加载中...</div>
  </div>
</template>

<script>
  import sectionTabs from './SectionTabs.vue'
  import IndexProductsBlockList from './IndexProductsBlockList.vue'
  import appDownloadOverlay from './appDownloadOverlay.vue'
  import { getIndexCars,getIndexHeafei,showBackBtn,hideBackBtn,showRightBtn,getSliderImages,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr,editTitle, getCampaigns } from '../../vuex/actions'
  import xxnrSwiper from '../../xxnr_mobile_ui/xxnrSwiper.vue'
  import xxnrSwipe from '../../xxnr_mobile_ui/xxnrSwipe.vue'
  //import { pcsubdomain, domain } from '../../../config'
  export default {
    data: function() {
        return {
          showLoader: false,
          protocol: window.location.protocol,
          showCampaign: false
        }
    },
    vuex:{
      getters:{
        indexCars:state => state.indexCarsList.indexCars,
        indexHuafei:state => state.indexCarsList.indexHuafei,
        slider: state => state.vueSlider.slider,
        test: state => state.indexConfig.test,
        domain: state => state.indexConfig.domain,
        pcsubdomain: state => state.indexConfig.pcsubdomain,
        campaignsList: state => state.vueSlider.campaignsList
      },
      actions:{
        getIndexCars,
        getIndexHeafei,
        showBackBtn,
        hideBackBtn,
        showRightBtn,
        getSliderImages,
        changeRightBtnMyXXNR,
        changeRightBtnPathMyxxnr,
        editTitle,
        getCampaigns
      }
    },
    methods: {
      setCookie: function(name, value, days, domain, path) {
        var expires = '';
        if (days) {
          var d = new Date();
          d.setTime(d.getTime() + (0.083*60*60*1000)); // 过期时间 0.83小时(5分钟)
          expires = '; expires=' + d.toGMTString();
        }
        domain = domain ? '; domain=' + domain : '';
        path = '; path=' + (path ? path : '/');
        document.cookie = name + '=' + value + expires + path + domain;
      },
      hideSwipe: function() {
        this.showCampaign = false;
        document.body.removeEventListener('touchmove', this.touchHandler, false);
      },
      showSwipe: function() {
        this.showCampaign = true;
        document.body.addEventListener('touchmove', this.touchHandler, false);
      },
      touchHandler: function(e){
        e.preventDefault();
      }
    },
    components: {
      sectionTabs,
      IndexProductsBlockList,
      appDownloadOverlay,
      xxnrSwiper,
      xxnrSwipe
    },
    created () {
      this.showLoader = true;
      this.getIndexCars();
      this.getIndexHeafei();
	    this.getSliderImages();
      this.getCampaigns();
    },
    ready (){
      this.showLoader = false;
    },
    route: {
//      deactivate (transition) {
//        //when back to /home hide the backBtn
//        if (transition.to.path === '/home') {
//          this.changeRightBtnMyXXNR();
//          this.changeRightBtnPathMyxxnr();
//        }
//        transition.next()
//      },
      activate(){
        this.changeRightBtnMyXXNR();
        this.changeRightBtnPathMyxxnr();
        this.hideBackBtn();
        this.showRightBtn();
        this.editTitle('新新农人');
      }
    }
  }
</script>

<style>
  .xxnr-title {
    position: relative;
    padding: 0 2%;
    height: 15px;
    line-height: 15px;
    font-size: 15px;
    margin: 16px 0;
    border-left: 4px solid #ff8822;
    color: #323232;
  }

  .xxnr-title-huafei {
    border-color: #33AA44;
  }

  .xxnr-title-car {
    border-color: #FF8822;
  }

  .title-more {
    position: absolute;
    right: 2%;
    font-size: 12px;
    line-height: 12px;
    bottom: 0px;
  }

  .container {
    padding: 0 2%;
  }

  .product-item {
    width: 48%;
    float: left;
    margin-left: 4%;
    height: 130px;
    background-color: #00CC99;
    margin-bottom: 8px;
  }

  .product-item:nth-child(2n +1 ) {
    margin-left: 0;
  }

  .footer {
    color: #999;
    text-align: center;
    font-size: 12px;
    padding: 15px 0 8px;
  }

  .footer-tel {
    font-size: 12px;
    line-height: 40px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 8px;
  }

  .footer-company, .footer-ICP {
    color: #999;
    text-align: center;
    font-size: 12px;
  }

  .footer-link {
    display: flex;
  }

  .footer-link a {
    display: inline-block;
    flex: auto;
    font-size: 15px;
    border-left: 1px solid #ccc;
    color: #909090;
  }

  .footer-link a:first-child {
    border-left: none;
  }

  input[type="radio"] {
    display: none;
  }

  label {
    background: #CCC;
    display: inline-block;
    cursor: pointer;
    width: 10px;
    height: 10px;
    border-radius: 5px;
  }

  .swipe-mask {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #000;
    opacity: .5;
    z-index: 99;
  }

  .swipe-mask-hide {
    position: fixed;
    z-index: 101;
    top: 20px;
    left: 12px;
    width: 24px;
  }

  .swipe-mask-hide img {
    width: 100%;
  }

  .campaign-icon {
    position: fixed;
    z-index: 51;
    top: 9px;
    width: 25px;
    left: 2%;
  }

  .campaign-icon img {
    width: 100%;
  }

</style>
