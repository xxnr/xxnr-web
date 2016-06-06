<template>
  <div class="container" style="padding: 0">
    <app-download-overlay></app-download-overlay>
    <vux-swiper :list="slider" height="180px" auto @on-index-change="onIndexChange"></vux-swiper>
  </div>
  <section-tabs></section-tabs>
  <div class="container">
    <div class="container">
      <div class="xxnr-title xxnr-title-car">
        汽车精选
        <div class="title-more"><a v-link="{ path: '/cars' }">更多产品&nbsp;></a></div>
      </div>
      <index-products-block-list :products="indexCars"></index-products-block-list>
      <div class="xxnr-title xxnr-title-huafei">
        化肥精选
        <div class="title-more"><a v-link="{ path: '/huafei' }">更多产品&nbsp;></a></div>
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
        <a>电脑版</a>
        <a>客户端</a>
      </div>
      <div class="footer-tel">客服电话：400-056-0371</div>
      <div class="footer-company">北京新新农人网络科技有限公司</div>
      <div>京ICP备15037751</div>
    </div>
  </div>
</template>

<script>
  import sectionTabs from './SectionTabs.vue'
  import IndexProductsBlockList from './IndexProductsBlockList.vue'
  import appDownloadOverlay from './appDownloadOverlay.vue'
  import { getIndexCars,getIndexHeafei,showBackBtn,hideBackBtn,showRightBtn,getSliderImages,changeRightBtnMyXXNR,changeRightBtnPathMyxxnr } from '../../vuex/actions'
  import vuxSwiper from 'vux/components/swiper'
  export default {
    vuex:{
      getters:{
        indexCars:state => state.indexCarsList.indexCars,
        indexHuafei:state => state.indexCarsList.indexHuafei,
        slider: state => state.vueSlider.slider
      },
      actions:{
        getIndexCars,
        getIndexHeafei,
        showBackBtn,
        hideBackBtn,
        showRightBtn,
        getSliderImages,
        changeRightBtnMyXXNR,
        changeRightBtnPathMyxxnr
      }
    },
    methods: {
    },
    components: {
      sectionTabs,
      IndexProductsBlockList,
      appDownloadOverlay,
      vuxSwiper
    },
    created () {
      this.getIndexCars();
      this.getIndexHeafei();
	    this.getSliderImages();
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
      }
    }
  }
</script>

<style>
  @import '~vux/vux.css';
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

  .footer-company {

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

  .swiper .item .desc{
    display: none;
  }
  .indicator{
    /*position: absolute;*/
    left: 50%;
    transform: translateX(-50%);
    right:auto;
  }
  .icon_dot.active{
    background: #01E8AB;
  }

</style>
