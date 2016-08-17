<template>
  <div class="order-list-box">
    <div v-if="orders" v-for="order in orders" class="order-item">
      <div class="order-line">
        {{order.dateCreated}}
        <div class="order-line-right"><span class="order-orange">{{order.orderStatus.value}}</span></div>
      </div>
      <div class="order-gift-con" @click="toggleCode($index);" v-if="order.orderStatus.type != 0 && order.orderStatus.type != 4">
        <div class="order-gift-img">
          <img :src="order.gift.thumbnail" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
        </div>
        <div class="order-gift-info">
          <div class="order-gift-info-con">
            <div class="order-gift-name">{{order.gift.name}}</div>
            <div class="order-gift-point">{{order.gift.points}}</div>
          </div>
        </div>
        <div class="clear"></div>
        <div class="order-arrow" @click="showCode($index);" :class="{rotate180: $index == showIndex}" v-if="order.orderStatus.type != 0 && order.orderStatus.type != 4">
          <img src="/assets/images/order-arrow.png">
        </div>
      </div>
      <div class="order-gift-con" v-else>
        <div class="order-gift-img">
          <img :src="order.gift.thumbnail" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
        </div>
        <div class="order-gift-info">
          <div class="order-gift-info-con">
            <div class="order-gift-name">{{order.gift.name}}</div>
            <div class="order-gift-point">{{order.gift.points}}</div>
          </div>
        </div>
        <div class="clear"></div>
        <div class="order-arrow" @click="showCode($index);" :class="{rotate180: $index == showIndex}" v-if="order.orderStatus.type != 0 && order.orderStatus.type != 4">
          <img src="/assets/images/order-arrow.png">
        </div>
      </div>
      <div  v-show="$index == showIndex" @click="hideCode();">
        <div v-if="order.deliveryType != 1" class="order-unsupport">
          暂不支持该商品兑换，请下载新新农人APP~
        </div>
        <div v-if="order.deliveryType == 1">
          <div class="order-line">
            请凭自提码到网点提货
            <div class="order-line-right">
              自提码：<span class="order-orange">{{order.deliveryCode}}</span>
            </div>
          </div>
          <div class="consignee-address-box">
            <div class="order-line-top"></div>
            <div class="order-address-rsc">
              <div>{{order.RSCInfo.companyName}}</div>
              <div>{{order.RSCInfo.RSCAddress}}</div>
              <div>{{order.RSCInfo.RSCPhone}}</div>
              <div class="rsc-bit"></div>
            </div>
            <div class="order-address-consignee">
              <div class="consignee-bit"></div>
              {{order.consigneeName}} {{order.consigneePhone}}
            </div>
            <div class="order-line-bottom"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['orders'],
    data(){
      return {
        showIndex: -1
      }
    },
    methods: {
      showCode: function (index){
        if(this.showIndex != -1 && this.showIndex == index) {
          this.showIndex = -1;
          return;
        }
        this.showIndex = index;
      },
      hideCode: function () {
        this.showIndex = -1;
      },
      toggleCode: function(index) {
        if(this.showIndex == -1) {
          this.showCode(index);
          return;
        }
        this.hideCode();
      }
    }
  }
</script>

<style scoped>
  .order-item {
    background-color: #fff;
    margin-bottom: 10px;
    border-top: 1px solid #c7c7c7;
  }

  .order-line {
    line-height: 45px;
    font-size: 14px;
    padding: 0 2%;
    position: relative;
  }

  .order-line-right {
    position: absolute;
    top: 0;
    right: 2%;
  }

  .order-gift-info {
    position: absolute;
    left: 0;
  }

  .order-gift-info-con {
    margin-left: 105px;
    height: 90px;
  }

  .order-gift-img {
    float: left;
    width: 90px;
    height: 90px;
    border: 1px solid #c7c7c7;
  }

  .order-gift-img img {
    width: 100%
  }

  .order-gift-name {
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 22px;
    height: 44px;
  }

  .order-gift-point {
    font-size: 20px;
    color: #EE4E00;
    background: url('/static/assets/images/integral_detail.png') 0 8px no-repeat;
    padding-left: 15px;
    line-height: 30px;
  }

  .order-gift-con {
    position: relative;
    padding: 15px 2%;
    border-top: 1px solid #c7c7c7;
    border-bottom: 1px solid #c7c7c7;
  }

  .order-orange {
    color: #FE9B00;
  }

  .order-line-top {
    width: 100%;
    height: 3px;
    background: url('/static/assets/images/order_line_top.png') 0 0 repeat-x;
  }

  .order-line-bottom {
    width: 100%;
    height: 3px;
    background: url('/static/assets/images/order_line_bottom.png') 0 0 repeat-x;
  }

  .rsc-bit {
    width: 13px;
    height: 18px;
    background: url('/static/assets/images/position.png') 0 0 no-repeat;
  }

  .consignee-bit {
    width: 16px;
    height: 16px;
    background: url('/static/assets/images/call-contact.png') 0 0 no-repeat;
  }

  .consignee-bit, .rsc-bit {
    position: absolute;
    top: 10px;
    left: 2%;
  }

  .order-address-rsc, .order-address-consignee {
    line-height: 20px;
    margin: 0 2%;
    padding: 10px 0 10px 30px;
    position: relative;
    font-size: 14px;
  }

  .consignee-address-box {
    background-color: #FFFCF6;
  }

  .order-address-consignee {
    border-top: 1px solid #c7c7c7;
  }

  .order-arrow {
    width: 14px;
    height: 8px;
    position: absolute;
    right: 2%;
    bottom: 15px;
  }

  .rotate180 {
    transform-origin: 50% 50%;
    transform: rotate(180deg);
  }

  .order-list-box {
    padding-top: 50px;
  }

  .order-unsupport {
    font-size: 14px;
    color: #909090;
    padding: 0 2%;
    line-height: 40px;
    border-bottom: 1px solid #E0E0E0;
  }
</style>
