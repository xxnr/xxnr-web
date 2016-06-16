<template>
  <div class="self-delivery-top">
    <div>
      商品已配送至服务网点，请凭自提码到网点提货
    </div>
    <div>
      自提码：<span class="self-delivery-code">{{deliveryCode}}</span>
    </div>
  </div>
  <div class="self-delivery-info">
    <div class="self-delivery-line">
      <div class="self-delivery-attr">
        服务网点
      </div>
    </div>
    <div class="self-delivery-line">
      <div class="self-delivery-attr">
        网点名称
      </div>
      <div class="self-delivery-value">
        {{RSCInfo.companyName}}
      </div>
      <div class="clear"></div>
    </div>
    <div class="self-delivery-line">
      <div class="self-delivery-attr">
        地址
      </div>
      <div class="self-delivery-value">
        {{RSCInfo.RSCAddress}}
      </div>
      <div class="clear"></div>
    </div>
    <div class="self-delivery-line">
      <div class="self-delivery-attr">
        电话
      </div>
      <div class="self-delivery-value">
        {{RSCInfo.RSCPhone}}
      </div>
      <div class="clear"></div>
    </div>
  </div>
  <div class="self-delivery-title">
    可自提商品
  </div>
  <div class="self-delivery-product-box">
    <div class="self-delivery-product" v-for="item in SKUList">
      <div class="container">
        <div class="self-delivery-product-name">
          {{item.productName}}
        </div>
        <div class="self-delivery-product-sku">
          <span v-if="item.attributes" v-for="attribute in item.attributes">
            {{attribute.name}}：{{attribute.value}}；
          </span>
        </div>
        <div class="self-delivery-product-sku" v-if="item.additions">
          附加项目：
          <span v-for="addition in item.additions">
            {{addition.name}};
          </span>
        </div>
        <div class="self-delivery-product-count">x{{item.count}}</div>
      </div>
    </div>
  </div>
</template>
<script>
  import { selfDelivery,editTitle,showBackBtn } from '../../vuex/actions'

  export default {
    vuex: {
      getters: {
        deliveryCode: state => state.order.deliveryCode,
        SKUList: state => state.order.orderInfo.rows.SKUList,
        RSCInfo: state => state.order.orderInfo.rows.RSCInfo
      },
      actions: {
        selfDelivery,editTitle,showBackBtn
      }
    },
    route: {
      activate(transition) {
        this.selfDelivery();
        this.editTitle('网点自提');
        this.showBackBtn();
        transition.next();
      }
    }
  }
</script>

<style scoped>
  .self-delivery-line {
    position: relative;
    font-size: 16px;
    line-height: 18px;
    padding: 13px 0 13px 77px;
    background-color: #fff;
    border-bottom: 1px solid #E7E7E7;
    min-height: 18px;
  }

  .self-delivery-attr {
    position: absolute;
    left: 2%;
    color: #646464;
  }

  .self-delivery-value {
    color: #323232;
  }

  .self-delivery-top {
    line-height: 30px;
    font-size: 16px;
    padding: 15px 2%;
    margin-top: 10px;
    background-color: #fff;
    border-bottom: 1px solid #e7e7e7;
    margin-bottom: 10px;
  }

  .self-delivery-code {
    color: #FF8822;
  }

  .self-delivery-title {
    line-height: 40px;
    height: 40px;
    padding: 0 2%;
    border: 1px solid #e7e7e7;
    background-color: #f4f4f4;
    margin-top: 10px;
  }

  .self-delivery-product {
     position: relative;
     border-bottom: 1px solid #eaeaea;
     background-color: #fff;
    padding-bottom: 8px;
  }

  .self-delivery-product-name {
    font-size: 16px;
    line-height: 30px;
    color: #323232;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
    width: 80%;
    text-overflow: ellipsis;
  }

  .self-delivery-product-sku {
    font-size: 14px;
    color: #909090;
    line-height: 16px;
  }

  .self-delivery-product-count {
    position: absolute;
    right: 2%;
    top: 0;
  }

  .self-delivery-product-box {
    padding-bottom: 30px;
  }
</style>
