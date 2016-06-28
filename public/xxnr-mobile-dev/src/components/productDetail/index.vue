<template>
  <div class="container">
    <div class="product-img"><img :src="productDetail.imgUrl"></div>
  </div>
  <div class="product-info">
    <div class="container">
      <div class="product-name">
        {{productDetail.name}}
      </div>
      <div class="" v-if="productDetail.presale">
        即将上线
      </div>
      <div class="product-price-box" v-if="!productDetail.presale">
        <div class="product-SKUPrice">
          {{'￥'+productDetail.minPrice}} {{productDetail.maxPrice==productDetail.minPrice?"":"-"}} {{(productDetail.maxPrice==productDetail.minPrice?"":productDetail.maxPrice)}}
        </div>
        <div class="product-deposit" v-if="productDetail.deposit && productDetail.online">
          订金：<span class="product-deposit-num">{{'¥' + productDetail.deposit}}</span>
        </div>
        <div class="clear"></div>
        <div class="product-SKUMarketPrice" v-if="productDetail.marketMinPrice != 0">
          市场价：{{'￥ '+productDetail.marketMinPrice}} {{productDetail.marketMaxPrice==productDetail.marketMinPrice?"":"-"}} {{(productDetail.marketMaxPrice==productDetail.marketMinPrice?"":productDetail.marketMaxPrice)}}
        </div>
      </div>
    </div>
  </div>
  <div class="product-detail-description" v-if="productDetail.description">
    {{productDetail.description}}
  </div>
  <div class="product-detail-title" v-if="productDetail.online" @click="showAttrBox(1);">
    <div class="container">
      <div class="product-skulist">
        <div v-if="SKUList.length == 0">请选择商品属性</div>
        <div v-else class="product-skulist-con">已选择:<span v-for="item in SKUList" track-by="$index">"{{item}}"</span><span v-if="AdditionList" v-for="item in AdditionList" track-by="$index">"{{item}}"</div>
        <img class="productDetail-arrow" src="/assets/images/productDetail_arrow.png" alt="">
      </div>
    </div>
  </div>
  <div class="product-detail-tab">
    <div class="container">
      <ul class="product-detail-tab-ul">
        <li :class="{'checked': tabIndex == 0}" @click="productDetailTab(0);">
          <div class="tab-underline">
            商品描述
          </div>
        </li>
        <li :class="{'checked': tabIndex == 1}" @click="productDetailTab(1);">
          <div class="tab-underline">
            详细参数
          </div>
        </li>
        <li :class="{'checked': tabIndex == 2}" @click="productDetailTab(2);">
          <div class="tab-underline">
            服务说明
          </div>
        </li>
        <li class="clear"></li>
      </ul>
      <div class="product-detail-tab-con">
        <div v-if="tabIndex == 0">
          <iframe name="Info1" id="Info1" onload="this.height = Info1.document.body.scrollHeight" width="100%" scrolling="no" frameborder="0" :src="productDetail.app_body_url">

          </iframe>
          <!--{{{productDetail.productDesc}}}-->
        </div>
        <div v-if="tabIndex == 1">
          <iframe name="Info2" id="Info2" onload="this.height = Info2.document.body.scrollHeight" width="100%" scrolling="no" frameborder="0" :src="productDetail.app_standard_url">

          </iframe>
        </div>
        <div v-if="tabIndex == 2">
          <iframe name="Info3" id="Info3" onload="this.height = Info3.document.body.scrollHeight" width="100%" scrolling="no" frameborder="0" :src="productDetail.app_support_url">

          </iframe>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom-btn presale" v-if="!productDetail.online">
    商品已下架
  </div>
  <div class="bottom-btn" @click="showAttrBox(2);" v-if="!productDetail.presale && productDetail.online">
    {{productDetail.buyActionName}}
  </div>
  <div class="bottom-btn presale" v-if="productDetail.presale && productDetail.online">
    敬请期待
  </div>
  <div class="attr-box" v-show="attrBoxDisplay">
    <div class="close-attr-box" @click="hideAttrBox();">
      <img src="../../../static/assets/images/close-box.png">
    </div>
    <div class="attr-box-container" style="-webkit-overflow-scrolling: touch;">
      <div class="attr-product">
        <div class="attr-product-img">
          <img :src="productDetail.imgUrl">
        </div>
        <div class="attr-product-info">
          <div class="attr-product-info-con">
            <div class="attr-product-name">
              {{productDetail.name}}
            </div>
            <div class="attr-product-price" v-if="!productDetail.presale">
              {{'¥'+productDetail.minPrice}} {{productDetail.maxPrice==productDetail.minPrice?"":"-"}} {{(productDetail.maxPrice==productDetail.minPrice?"":productDetail.maxPrice)}}
            </div>
            <div v-if="productDetail.presale" style="color: #909090;">
              即将上线
            </div>
          </div>
        </div>
        <div class="clear"></div>
      </div>
      <div class="attr-product-h"></div>
      <div class="container">
        <div v-for="sku in productDetail.SKUAttributes" class="sku-block">
          <div class="sku-name">{{sku.name}}</div>
          <li v-for="item in sku.values" :class="{'sku-item': true,'checked':sku.isSelected[$index], 'unselectable': !sku.selectable[$index]}" @click="selectSKU($parent.$index, $index);" >
            {{item}}
          </li>
          <li class="clear"></li>
        </div>
        <div v-if="productDetail.SKUAdditions && productDetail.SKUAdditions.length != 0 && isAllSKUSelected">
          <div class="sku-name">附加项目</div>
          <li v-for="item in productDetail.SKUAdditions" :class="{'sku-item': true,'checked':item.isSelected}" @click="selectAddition($index);">
            {{item.name}} (+{{item.price}})
          </li>
          <div class="clear"></div>
        </div>
        <div class="sku-name" v-if="!productDetail.presale">
          数量
        </div>
        <div class="product-num" v-if="!productDetail.presale">
          <div>
            <input type="button" value="-" class="product-num-btn" @click="changeProductNumber(-1);">
            <input type="text" disabled class="product-num-text" value="{{productNumber}}" id="product-num">
            <input type="button" value="+" class="product-num-btn" @click="changeProductNumber(1);">
            <div class="clear"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-btn-static presale" v-if="!productDetail.online">
      商品已下架
    </div>
    <div class="bottom-btn-static" @click="buyProduct(),showToast();" v-if="!productDetail.presale && productDetail.online" :class="{'disabled': !isAllSKUSelected}">
      <span v-if="attrBoxType == 2">确定</span><span v-else>{{productDetail.buyActionName}}</span>
    </div>
    <div class="bottom-btn-static presale" v-if="productDetail.presale && productDetail.online">
      敬请期待
    </div>
  </div>
  <div class="mask" v-show="attrBoxDisplay" @click="hideAttrBox();"></div>
  <div class="toast-container" v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>

<script>
  import {
    getProductDetail,
    showAttrBox,
    hideAttrBox,
    productDetailTab,
    changeProductNumber,
    selectSKU,
    querySKUs,
    selectAddition,
    buyProduct,
    clearProductDetail,
    showBackBtn,
    editTitle,
    isFromOrder
  } from '../../vuex/actions'
  import xxnrToast from '../../xxnr_mobile_ui/xxnrToast.vue'
  import {getUrlParam} from '../../utils/common'

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
    vuex: {
      getters: {
        productDetail: state => state.productDetail.product,
        attrBoxDisplay: state => state.productDetail.attrBoxDisplay,
        tabIndex: state => state.productDetail.tabIndex,
        productNumber: state => state.productDetail.productNumber,
        isAllSKUSelected: state => state.productDetail.isAllSKUSelected,
        toastMsg: state => state.toastMsg,
        SKUList: state => state.productDetail.SKUList,
        AdditionList: state => state.productDetail.AdditionList,
        attrBoxType: state => state.productDetail.attrBoxType
      },
      actions: {
        getProductDetail,
        showAttrBox,
        hideAttrBox,
        productDetailTab,
        changeProductNumber,
        selectSKU,
        querySKUs,
        selectAddition,
        buyProduct,
        clearProductDetail,
        showBackBtn,
        editTitle,
        isFromOrder
      }
    },
    components: {
      xxnrToast
    },
    detached() {
      this.clearProductDetail();
    },
    route: {
      activate (transition) {
        this.isFromOrder(transition.from.path);
        this.getProductDetail(getUrlParam('id'));
        this.showBackBtn();
        this.editTitle('商品详情');
        transition.next();
      }//,
//      canDeactivate (transition) {
//        this.clearProductDetail();
//        transition.next();
//      }

    }
  }
</script>

<style scoped>
  .attr-box-container {
    height:400px;
    overflow-y:scroll;
    z-index: 0;
  }

  .product-info {
    border-top: 1px solid #c7c7c7;
  }
  .product-img img {
    width: 100%;
    /*height: 200px;*/
  }

  .product-name {
    color: #323232;
    font-size: 16px;
    line-height: 20px;
    padding: 12px 0;
  }

  .product-SKUPrice {
    color: #ff4e00;
    font-size: 18px;
    float: left;
  }

  .product-SKUMarketPrice {
    color: #909090;
    font-size: 12px;
    text-decoration: line-through;
    line-height: 26px;
  }

  .product-deposit {
    float: left;
    font-size: 14px;
    margin-left: 16px;
  }

  .product-deposit-num {
    color: #ff4e00;
    font-size: 18px;
  }

  .product-detail-title {
    color: #323232;
    font-size: 16px;
    line-height: 40px;
    min-height: 40px;
    background-color: #f2f2f2;
    position: relative;
  }
  .productDetail-arrow{
    position: absolute;
    width: 10px;
    height: 17px;
    top: 12px;
    right: 5px;
  }
  .bottom-btn {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #fe9800;
    text-align: center;
    line-height: 40px;
    height: 40px;
    font-size: 18px;
    color: #fff;
    z-index: 100;
  }

  .bottom-btn.presale {
    background-color: #E2E2E2;
    color: #909090;
  }

  .bottom-btn-static {
    width: 100%;
    background-color: #fe9800;
    text-align: center;
    line-height: 40px;
    height: 40px;
    font-size: 18px;
    color: #fff;
  }

  .bottom-btn-static.disabled {
    background-color: #E2E2E2;
  }

  .bottom-btn-static.presale {
    background-color: #E2E2E2;
    color: #909090;
  }

  .product-detail-tab-ul li{
    font-size: 15px;
    line-height: 15px;
    margin: 12px 0;
    text-align: center;
    width: 33.33%;
    box-sizing: border-box;
    border-left: 1px solid #ebebeb;
    float: left;
  }

  .product-detail-tab-ul li:first-child {
    border-left: none;
  }

  .tab-underline {
    padding-bottom: 10px;
    width: 60%;
    margin: 0 20%;
  }

  .product-detail-tab-ul li.checked .tab-underline {
    border-bottom: 1px solid #00b38a;
    color: #00b38a;
  }

  .attr-box {
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 101;
    background-color: #fff;
  }

  .attr-product-img {
    float: left;
    width: 75px;
    border: 1px solid #c7c7c7;
    margin-right: 6px;
  }

  .attr-product-img img {
    width: 100%;
  }

  .attr-product-name {
    color: #323232;
    font-size: 14px;
    line-height: 22px;
    height: 44px;
    overflow: hidden;
  }

  .attr-product-info {
    position: absolute;
    left: 0;
  }

  .attr-product-price {
    color: #ff4e00;
    font-size: 16px;
  }

  .attr-product {
    height: 75px;
    width: 100%;
    position: absolute;
    padding: 10px 0;
    border-bottom: 1px solid #E0E0E0;
    background-color: #fff;
    top:0;
  }

  .attr-product-h {
    height: 96px;
  }

  .sku-item {
    float: left;
    line-height: 30px;
    background-color: #f0f0f0;
    margin-right: 10px;
    font-size: 14px;
    border-radius: 5px;
    padding: 0 6px;
    margin-bottom: 8px;
    white-space: nowrap;
    word-break: break-all;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 98%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .sku-name {
    line-height: 46px;
    font-size: 16px;
    color: #323232;
  }

  .attr-product-info-con {
    margin-left: 81px;
    padding-right: 15px;
  }

  .product-num-text {
    border-top: 1px solid #c1c1c1;
    border-bottom: 1px solid #c1c1c1;
    height: 25px;
    margin: 0;
    width: 46px;
    outline: none;
    float: left;
    text-align: center;
    color: #323232;
    margin-bottom: 16px;
  }

  .product-num-btn {
    width: 27px;
    height: 27px;
    border: 1px solid #c1c1c1;
    font-size: 18px;
    font-weight: bold;
    color: #646464;
    outline: none;
    float: left;
  }

  .sku-item.checked {
    background-color: #fe9b00;
    color: #fff;
  }

  .sku-item.unselectable {
    background-color: #f0f0f0;
    color: #c1c1c1;
  }

  .product-detail-tab-con {
    padding-bottom: 40px;
    background-color: #fff;
  }
  li.clear {
    width: 0;
    height: 0;
    border: 0;
    padding: 0;
    margin: 0;
    float: none;
    clear: both;
  }

  .product-detail-tab-con img {
    width: 100%;
  }

  .product-detail-description {
    line-height: 20px;
    background-color: #F2F2F2;
    color: #00b38a;
    text-align: center;
    margin: 10px 0;
    font-size: 14px;
    padding: 10px 2%;
  }

  .close-attr-box {
    position: absolute;
    right: 2%;
    top: 15px;
    width: 13px;
    height: 13px;
    padding: 5px;
    margin-top: -5px;
    margin-right: -5px;
    z-index: 10;
  }

  .close-attr-box img {
    width: 100%;
  }

  .product-skulist {
    font-size: 14px;
    white-space: nowrap;
    word-break: break-all;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 90%;
  }

  .product-skulist-con{
    font-size: 14px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
