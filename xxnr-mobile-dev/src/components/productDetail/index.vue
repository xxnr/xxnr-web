<template>
  <div class="container">
    <div class="product-img"><img :src="productDetail.imgUrl"></div>
  </div>
  <div class="product-info">
    <div class="container">
      <div class="product-name">
        {{productDetail.goodsName}}
      </div>
      <div class="product-SKUPrice">
        {{'¥' + productDetail.SKUPrice.min}} - {{'¥' + productDetail.SKUPrice.max}}
      </div>
      <div class="product-deposit">
        订金：<span class="product-deposit-num">{{'¥' + productDetail.deposit}}</span>
      </div>
      <div class="clear"></div>
      <div class="product-SKUMarketPrice">
        市场价：{{'¥' + productDetail.SKUMarketPrice.min}} - {{'¥' + productDetail.SKUMarketPrice.max}}
      </div>
    </div>
  </div>
  <div class="product-detail-title">
    <div class="container">
      请选择商品属性
    </div>
  </div>
  <div class="product-detail-tab">
    <div class="container">
      <ul class="product-detail-tab-ul">
        <li class="checked">
          <div class="tab-underline">
            商品描述
          </div>
        </li>
        <li>
          <div class="tab-underline">
            详细参数
          </div>
        </li>
        <li>
          <div class="tab-underline">
            服务说明
          </div>
        </li>
        <li class="clear"></li>
      </ul>
    </div>
  </div>
  <div class="bottom-btn">
    立即购买
  </div>
  <div class="attr-box">
    <div class="container">
      <div class="attr-product">
        <div class="attr-product-img">
          <img :src="productDetail.imgUrl">
        </div>
        <div class="attr-product-info">
          <div class="attr-product-info-con">
            <div class="attr-product-name">
              {{productDetail.goodsName}}
            </div>
            <div class="attr-product-price">
              {{'¥' + productDetail.SKUPrice.min}} - {{'¥' + productDetail.SKUPrice.max}}
            </div>
          </div>
        </div>
        <div class="clear"></div>
      </div>
      <div class="container">
        <div v-for="sku in productDetail.SKUAttributes" class="sku-block">
          <div class="sku-name">{{sku.name}}</div>
          <li v-for="item in sku.values" class="sku-item">
            {{item}}
          </li>
          <li class="clear"></li>
        </div>
        <div v-if="productDetail.SKUAdditions">
          <div class="sku-name">附加项目</div>
          <li v-for="item in productDetail.SKUAdditions" class="sku-item">
            {{item.name}}
          </li>
          <div class="clear"></div>
        </div>
        <div class="sku-name">
          数量
        </div>
        <div class="product-num">
          <div>
            <input type="button" value="-" class="product-num-btn" @click="changeNumber(-1);">
            <input type="text" disabled class="product-num-text" value="1">
            <input type="button" value="+" class="product-num-btn" @click="changeNumber(1);">
            <div class="clear"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-btn-static">
      确定
    </div>
  </div>
  <div class="mask"></div>
</template>

<script>
  import { getProductDetail } from '../../vuex/actions'

  export default {
    vuex: {
      getters: {
        productDetail: state => state.productDetail.product
      },
      actions: {
        getProductDetail
      }
    },
    created () {
      var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
      this.getProductDetail(test[1]);
    },
    method: {
      changeNumber(type) {
        if(type == 1) {
          console.log('aaa');
        }

        if(type == -1) {
          console.log('bbb');
        }
      }
    }
  }
</script>

<style scoped>
  .product-info {
    border-top: 1px solid #c7c7c7;
  }
  .product-img img {
    width: 100%;
    height: 200px;
  }

  .product-name {
    color: #323232;
    font-size: 16px;
    line-height: 45px;
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
    background-color: #f2f2f2;
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

  .bottom-btn-static {
    width: 100%;
    background-color: #fe9800;
    text-align: center;
    line-height: 40px;
    height: 40px;
    font-size: 18px;
    color: #fff;
  }

  .product-detail-tab-ul li{
    font-size: 16px;
    line-height: 16px;
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
    position: relative;
    padding: 10px 0;
    border-bottom: 1px solid #E0E0E0;
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
  }

  .sku-name {
    line-height: 46px;
    font-size: 16px;
    color: #323232;
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    opacity: .6;
    z-index: 100;
  }

  .attr-product-info-con {
    margin-left: 81px;
  }

  .product-num-text {
    border-top: 1px solid #c1c1c1;
    border-bottom: 1px solid #c1c1c1;
    height: 23px;
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

  .sku-item.checked{
    background-color: #fe9b00;
    color: #fff;
  }
</style>
