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
        <div class="order-rsc" v-link="{path: '/orderRSC?id=' + orderId + '&count=' + count + '&productId=' + productId}">
          <div class="order-rsc-bit"></div>
          <span v-if="!orderRSC.address">订单中的商品将配送至服务站，请选择自提网点</span>
          {{orderRSC.address}}
        </div>
        <div class="order-consignee" v-link="{path: '/orderConsignee?id=' + orderId + '&count=' + count + '&productId=' + productId}">
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
                  <img :src="cartList.imgUrl" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
                </div>
                <div class="product-info">
                  <div class="product-info-con">
                    <div class="product-name">
                      {{cartList.productName}}
                    </div>
                    <div class="product-sku">
                      <span v-if="cartList.attributes" v-for="attribute in cartList.attributes">
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
                <div class="product-pay-value orange" v-if="cartList.price">
                  ¥{{cartList.price.toFixed(2)}}
                </div>
              </div>
              <div class="product-addtions">
                <div class="container">
                  <ul>
                    <li class="product-addtions-line" v-if="cartList.additions" v-for="addition in cartList.additions">
                      <div class="product-addtions-attr">{{addition.name}}</div>
                      <div class="product-addtions-value">¥{{addition.price.toFixed(2)}}</div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="product-pay-line" v-if="cartList.deposit">
                <div class="product-pay-attr">
                  阶段一：订金
                </div>
                <div class="product-pay-value orange">
                  ¥{{(cartList.deposit * cartList.count).toFixed(2)}}
                </div>
              </div>
              <div class="product-pay-line" v-if="cartList.deposit">
                <div class="product-pay-attr">
                  阶段二：尾款
                </div>
                <div class="product-pay-value">
                  ¥{{((cartList.price + additionsTotalPrice) * cartList.count - cartList.deposit * cartList.count).toFixed(2)}}
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
  <div class="order-bottom">
    <div class="order-bottom-total">
      <div class="order-bottom-total-con">
        合计：<span class="orange">¥{{totalPrice.toFixed(2)}}</span>
      </div>
    </div>
    <div class="order-bottom-commit" @click="commitOrder(),showToast()">
      提交订单
    </div>
  </div>
  <div class="toast-container" v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>
<script>
  import { getRSCListByProduct, getShoppingCart, commitOrder, editTitle, showBackBtn, resetOrderCondignee, resetOrderRSC, selectConsigneeAuto } from '../../vuex/actions'
  import xxnrToast from '../../xxnr_mobile_ui/xxnrToast.vue'
  import {getUrlParam} from '../../utils/common'

  export default {
    data: function () {
      return {
        toastShow: false,
        orderId: getUrlParam('id'),
        count: getUrlParam('count'),
        productId: getUrlParam('productId')
      }
    },
    vuex: {
      getters: {
        //TODO: state or data
        RSCList: state => state.order.RSCList,
        orderRSC: state => state.order.orderRSC,
        cartList: state => state.order.cartList,
        totalPrice: state => state.order.totalPrice,
        orderConsignee: state => state.order.orderConsignee,
        toastMsg: state => state.toastMsg,
        additionsTotalPrice:state => state.order.additionsTotalPrice
  },
  actions: {
    getRSCListByProduct,
      getShoppingCart,
      commitOrder,
      editTitle,
      showBackBtn,
      resetOrderCondignee,
      resetOrderRSC,
      selectConsigneeAuto
  }
  },
  components: {
    xxnrToast
  }
  ,
  methods: {
    showRSCList()
    {
      //window.location.href = '/orderRSC?id=' + getUrlParam('id') + '&count=' + getUrlParam('count') + '&productId=' + getUrlParam('productId');
    },
    showConsignee()
    {
      //window.location.href = '/#!/orderConsignee?id=' + getUrlParam('id') + '&count=' + getUrlParam('count') + '&productId=' + getUrlParam('productId');
    },
    showToast(){
      this.toastShow = true;
    }
  },
  route: {
    activate(transition)
    {
      this.editTitle('提交订单');
      this.showBackBtn();
      this.getShoppingCart();
      var path = transition.from.path;
      this.resetOrderCondignee(path);
      this.resetOrderRSC(path);
      this.orderId = getUrlParam('id');
      this.count = getUrlParam('count');
      this.productId = getUrlParam('productId');
      document.getElementsByTagName('body')[0].scrollTop = 0;
      transition.next();
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
    padding-bottom: 45px;
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
    min-height: 90px;
    margin: 0 2%;
    padding-top: 10px;
  }

  .product-img {
    float: left;
    width: 90px;
    height: 90px;
    border: 1px solid #e3e3e3;
  }

  .product-img img {
    width: 100%;
  }

  .product-info {
    position: relative;
    left: 0px;
  }

  .product-name {
    font-size: 16px;
    line-height: 18px;
    height: 36px;
    overflow: hidden;
    margin-bottom: 8px;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
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
    position: absolute;
    right: 0;
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
