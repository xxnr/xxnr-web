<template>
  <div v-if="!isNull">
    <div class="gift-img">
      <img :src="giftDetail.largeUrl" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
    </div>
    <div class="gift-info">
      <div class="gift-name">{{giftDetail.name}}</div>
      <div>
        <div class="gift-points">{{giftDetail.points}}</div>
        <div class="user-score" v-if="score != -1 && giftDetail.online && !giftDetail.soldout">可用积分 <span class="orange">{{score}}</span></div>
        <div class="clear"></div>
      </div>
      <div class="gift-market-price" v-if="giftDetail.marketPrice && giftDetail.marketPrice != 0">
        市场价&nbsp;&nbsp;<span class="line-through">{{giftDetail.marketPrice}}</span>
      </div>
    </div>
    <div class="gift-appbody">
      <iframe name="appbody" id="appbody" onload="this.height = appbody.document.body.scrollHeight" width="100%" scrolling="no" frameborder="0" v-if="giftDetail.appbody_url" :src="giftDetail.appbody_url">
      </iframe>
    </div>
    <div class="gift-bottom">
      <div class="gift-bottom-btn" v-if="giftDetail.change.type == 4" @click="changeGift();" v-if="!giftDetail.soldout">立即兑换</div>
      <div class="gift-bottom-btn invilid" v-else="!giftDetail.onsale">{{giftDetail.change.text}}</div>
    </div>
  </div>
</template>

<script>
  import { showBackBtn,hideRightBtn,editTitle, getGiftDetail, getUserPoint, clearGiftDetail } from '../../vuex/actions'
  import {getUrlParam} from '../../utils/common'

  export default {
    vuex:{
      getters:{
        giftDetail: state => state.point.giftDetail,
        score: state => state.point.score,
        isNull: state => state.point.isNull
      },
      actions:{
        showBackBtn,
        hideRightBtn,
        editTitle,
        getGiftDetail,
        getUserPoint,
        clearGiftDetail
      }
    },
    methods: {
      changeGift: function() {
        router.go('/giftOrder?giftId=' + this.giftDetail.id + '&gift_id=' + this.giftDetail._id);
      }
    },
    components:{
    },
    route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('商品详情');
        this.getUserPoint();
        this.getGiftDetail(getUrlParam('id'));
      },
      deactivate() {
        this.clearGiftDetail();
      }
    }
  }
</script>

<style scoped>
  .gift-img {
    width: 100%;
    background-color: #fff;
  }

  .gift-img img {
    width: 100%;
  }

  .gift-name {
    font-size: 16px;
    line-height: 25px;
    background-color: #fff;
  }

  .gift-points {
    float: left;
    font-size: 20px;
    color: #ff4e00;
    background: url('/static/assets/images/integral_detail.png') 0 7px no-repeat;
    padding-left: 15px;
    margin-top: 5px;
    line-height: 26px;
  }

  .gift-market-price {
    color: #909090;
    font-size: 12px;
  }

  .line-through {
    text-decoration: line-through;
  }

  .gift-info {
    background-color: #fff;
    padding: 5px 2%;
    border-top: 1px solid #e2e2e2;
    border-bottom: 1px solid #e0e0e0;
  }

  .gift-appbody {
    border-top: 1px solid #e0e0e0;
    margin-top: 10px;
    padding-bottom: 50px;
  }

  .gift-bottom-btn.invilid{
    background-color: #d2d2d2;
    color: #fff;
  }

  .user-score {
    float: right;
    font-size: 12px;
    line-height: 40px;
  }

  .orange {
    color: #ff4e00
  }
</style>
