<template>
  <div class="order-container">
    <div class="order-title">
      配送方式
    </div>
    <div>
      <div class="container">
        <div class="order-deliver-type">
          网点自提
          <div class="order-deliver-type-bit">
            <img src="/assets/images/deliverTypeChecked.png">
          </div>
        </div>
      </div>
    </div>
    <div class="order-rsc-info">
      <div class="container">
        <div class="order-rsc" @click="showRSCList();">
          <div class="order-rsc-bit"></div>
          <span v-if="!orderRSC.address">订单中的商品将配送至服务站，请选择自提网点</span>
          {{orderRSC.address}}
        </div>
        <div class="order-consignee" @click="showConsignee();">
          <div class="order-consignee-bit"></div>
          <span v-if="!orderConsignee.consigneePhone">请填写收货人信息</span>
          {{orderConsignee.consigneeName}}
          {{orderConsignee.consigneePhone}}
        </div>
      </div>
    </div>
    <div>
      <ul>
        <li>
          <div class="brand-name">
            <div class="container">
              {{cartList.brandName}}
            </div>
          </div>
          <ul>
            <li>
              <div class="product-con">
                <div class="product-img">
                  <img :src="product.imgUrl">
                </div>
                <div class="product-info">
                  <div class="product-info-con">
                    <div class="product-name">
                      {{cartList.productName}}
                    </div>
                    <div class="product-sku">
                      <span v-if="product.attributes" v-for="attribute in product.attributes">
                        {{attribute.name}}：{{attribute.value+ ';'}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="product-pay-line">
                <div class="product-pay-attr">
                  x {{cartList.count}}
                </div>
                <div class="product-pay-value orange">
                  ¥{{cartList.price}}
                </div>
              </div>
              <div class="product-addtions">
                <div class="container">
                  <ul>
                    <li class="product-addtions-line" v-if="product.additions" v-for="addition in cartList.additions">
                      <div class="product-addtions-attr">{{addition.name}}</div>
                      <div class="product-addtions-value">{{addition.price}}</div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="product-pay-line">
                <div class="product-pay-attr">
                  阶段一：订金
                </div>
                <div class="product-pay-value orange">
                  ¥{{cartList.deposit}}
                </div>
              </div>
              <div class="product-pay-line">
                <div class="product-pay-attr">
                  阶段二：尾款
                </div>
                <div class="product-pay-value">
                  ¥{{cartList.price * cartList.count - cartList.deposit}}
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
  <div class="order-bottom" @click="commitOrder();">
    <div class="order-bottom-total">
      <div class="order-bottom-total-con">
        合计：<span class="orange">¥{{totalPrice}}</span>
      </div>
    </div>
    <div class="order-bottom-commit">
      提交订单
    </div>
  </div>
</template>

<script>
  import { getRSCListByProduct, getShoppingCart, commitOrder, editTitle, showBackBtn } from '../../vuex/actions'

  export default {
    vuex: {
      getters: {
        RSCList: state => state.order.RSCList,
        orderRSC: state => state.order.orderRSC,
        cartList: state => state.order.cartList,
        totalPrice: state => state.order.totalPrice,
        orderConsignee: state => state.order.orderConsignee
      },
      actions: {
        getRSCListByProduct,
        getShoppingCart,
        commitOrder,
        editTitle,
        showBackBtn
      }
    },
    methods: {
      showRSCList() {
        var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
        window.location.href = '/#!/orderRSC?id=' + test[1];
      },
      showConsignee() {
        var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
        window.location.href = '/#!/orderConsignee?id=' + test[1];
      }
    },
    created() {
      this.getShoppingCart();
    },
    route: {
      activate(){
        this.editTitle('提交订单');
        this.showBackBtn();
        document.getElementsByTagName('body')[0].scrollTop = 0;
      }
    }
  }

</script>

<style scoped>
  .order-title {
    color: #323232;
    font-size: 16px;
    line-height: 40px;
    padding: 0 2%;
    border-bottom: 1px solid #E5E5E5;
  }

  .order-container {
    margin-top: 10px;
    background-color: #fff;
  }

  .order-rsc-info {
    font-size: 13px;
    background-color: #FFFCF6;
  }

  .brand-name {
    font-size: 16px;
    color: #323232;
    background-color: #fff;
    height: 44px;
    line-height: 44px;
    border-top: 1px solid #E5E5E5;
    border-bottom: 1px solid #E5E5E5;
  }

  .product-con {
    position: relative;
    height: 90px;
    margin: 0 2%;
    padding-top: 10px;
  }

  .product-img {
    float: left;
    width: 90px;
    height: 90px;
    background-color: #000;
  }

  .product-info {
    position: absolute;
    left: 0px;
  }

  .product-name {
    font-size: 16px;
    line-height: 18px;
    height: 36px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .product-info-con {
    margin-left: 100px;
  }

  .product-pay-line {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #e5e5e5;
    position: relative;
    margin: 2%;
  }

  .product-pay-attr {
    position: absolute;
    left: 0;
  }

  .product-pay-value {
    position: absolute;
    right: 0;
  }

  .orange {
    color: #ff4e00;
  }

  .product-addtions-line {
    position: relative;
    background-color: #F8F8F8;
    height: 22px;
    line-height: 22px;
    font-size: 12px;
    border-radius: 3px;
    margin-bottom: 2px;
  }

  .product-addtions-attr {
    position: absolute;
    left: 2%;
    color: #646464;
  }

  .product-addtions-value {
    position: absolute;
    right: 2%;
    color: #323232;
  }

  .product-sku {
    color: #909090;
    font-size: 14px;
    line-height: 16px;
  }

  .order-bottom {
    position: fixed;
    width: 100%;
    height: 44px;
    line-height: 44px;
    bottom: 0;
    left: 0;
    font-size: 14px;
  }

  .order-bottom-total {
    position: absolute;
    right: 0;
    width: 100%;
  }

  .order-bottom-total-con {
    margin-right: 110px;
    background-color: #fff;
    border-top: 1px solid #dfdfdf;
    text-align: right;
    color: #323232;
    padding-right: 8px;
  }

  .order-bottom-commit {
    float: right;
    width: 110px;
    background-color: #ff9b00;
    border-top: 1px solid #ff9b00;
    color: #fff;
    text-align: center;
  }

  .order-rsc, .order-consignee {
    position: relative;
    line-height: 15px;
    padding: 10px 0;
    padding-left: 25px;
  }

  .order-rsc {
    border-bottom: 1px solid #E2E2E2;
  }

  .order-rsc-bit {
    width: 13px;
    height: 17px;
    background: url('/static/assets/images/position.png') 0 0 no-repeat;
  }

  .order-consignee-bit {
    width: 16px;
    height: 16px;
    background: url('/static/assets/images/call-contact.png') 0 0 no-repeat;
  }

  .order-rsc-bit, .order-consignee-bit {
    position: absolute;
    left: 0;
    top: 10px;
  }

  .order-deliver-type {
    position: relative;
    border: 1px solid #fe9b00;
    width: 84px;
    text-align: center;
    height: 26px;
    line-height: 30px;
    line-height: 26px;
    font-size: 14px;
    margin: 12px 0;
    border-radius: 5px;
  }

  .order-deliver-type-bit {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 13px;
    height: 16px;
  }

  .order-deliver-type-bit img {
    width: 100%;
  }
</style>
