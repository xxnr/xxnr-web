<template>
  <div v-if="orderGift.category.deliveries[0].deliveryType == 1">
    <div class="gift-order-tip1">
      该礼品需到网点自提，请选择自提网点并填写收货人
    </div>
    <order-address :order-RSC=orderRSC :order-consignee="orderConsignee" :rsc-link="'/orderRSC?giftId=' + giftId + '&gift_id=' + gift_id" :consignee-link="'/orderConsignee?giftId=' + giftId + '&gift_id=' + gift_id">
    </order-address>
    <div class="gift-order-tip2">
      确认兑换后积分随即使用，无法退回，请认真核对
    </div>
    <div class="gift-order-title">
      兑换商品
    </div>
    <div class="order-gift">
      <div class="container">
        <div class="order-gift-img">
          <img :src="orderGift.thumbnail" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
        </div>
        <div class="order-gift-info">
          <div class="order-gift-info-con">
            <div class="order-gift-name">
              {{orderGift.name}}
            </div>
            <div class="order-gift-point">
              {{orderGift.points}}
            </div>
          </div>
        </div>
        <div class="clear"></div>
      </div>
    </div>
    <div class="gift-bottom">
      <div class="gift-bottom-btn" @click="commitGiftOrder(orderGift.id),showToast();">
        确认兑换
      </div>
    </div>
  </div>
  <un-support v-if="orderGift.category.deliveries[0].deliveryType != 1">

  </un-support>
  <div class="toast-container" v-show="toastMsg.length>0">
    <xxnr-toast :show.sync="toastShow" >
      <p>{{toastMsg}}</p>
    </xxnr-toast>
  </div>
</template>

<script>
  import { showBackBtn,hideRightBtn,editTitle, getUserPoint, getPointGifts, clearPointGifts, getOrderGiftDetail, resetOrderRSC, resetOrderCondignee, commitGiftOrder } from '../../vuex/actions'
  import {getUrlParam} from '../../utils/common'
  import orderAddress from '../orderAddress.vue'
  import xxnrToast from '../../xxnr_mobile_ui/xxnrToast.vue'
  import unSupport from './unSupport.vue'

  export default {
    data: function () {
      return {
        toastShow: false,
        giftId: getUrlParam('giftId'),
        gift_id: getUrlParam('gift_id')
      }
    },
    vuex:{
      getters:{
        toastMsg: state => state.toastMsg,
        orderGift: state => state.giftOrder.orderGift,
        RSCList: state => state.order.RSCList,
        orderRSC: state => state.order.orderRSC,
        orderConsignee: state => state.order.orderConsignee
      },
      actions:{
        showBackBtn,
        hideRightBtn,
        editTitle,
        getOrderGiftDetail,
        resetOrderRSC,
        resetOrderCondignee,
        commitGiftOrder
      }
    },
    components:{
      orderAddress,
      xxnrToast,
      unSupport
    },
    methods: {
      showToast(){
        this.toastShow = true;
      }
    },
    route: {
      activate(transition){
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('提交兑换');
        this.getOrderGiftDetail(getUrlParam('giftId'));

        var path = transition.from.path;
        this.resetOrderCondignee(path);
        this.resetOrderRSC(path);
        this.giftId = getUrlParam('giftId');
        this.gift_id = getUrlParam('gift_id');
        document.getElementsByTagName('body')[0].scrollTop = 0;
        transition.next();
      },
      deactivate() {

      }
    }
  }
</script>

<style scoped>
  .gift-order-tip1 {
    font-size: 12px;
    color: #FE9B00;
    line-height: 34px;
    padding: 0 2%;
  }

  .gift-order-tip2 {
    font-size: 12px;
    color: #646464;
    line-height: 40px;
    padding: 0 2%;
  }

  .gift-order-title {
    font-size: 14px;
    padding: 0 2%;
    line-height: 45px;
    border-top: 1px solid #e2e2e2;
    border-bottom: 1px solid #e2e2e2;
  }

  .order-gift-img {
    float: left;
    width: 90px;
    height: 90px;
    overflow: hidden;
    border: 1px solid #e2e2e2;
  }

  .order-gift-img img {
    width: 100%;
  }

  .order-gift-info {
    position: absolute;
    width: 100%;
    left: 0;
  }

  .order-gift-info-con {
    margin: 0 2%;
    padding-left: 100px;
  }

  .order-gift-name {
    font-size: 14px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .order-gift {
    padding: 15px 0;
    border-bottom: 1px solid #e2e2e2;
  }

  .order-gift-point {
    font-size: 20px;
    color: #ff4e00;
    background: url('/static/assets/images/integral_detail.png') 0 7px no-repeat;
    padding-left: 15px;
    margin-top: 5px;
  }
</style>
