<template>
  <div class="unlogin-tips" v-if="score == -1" v-link="{path: 'login?ref=/rewardShop'}">
    您还未登录，立即登陆兑换礼品、签到拿积分
    <div class="unlogin-arrow"></div>
  </div>
  <div class="point-tab-box">
    <ul>
      <li class="point-tab" v-link="{path: 'myPoint'}">
        <img src="/assets/images/point_icon.png">
        <div class="title">
          <span class="my-point">{{score == -1 ? 0: score}} </span>积分
        </div>
      </li>
      <li class="point-tab" v-link="{path: '/pointsLogs/unComplete'}">
        <img src="/assets/images/point_record_icon.png">
        <div class="title">兑换记录</div>
      </li>
      <li class="point-tab" v-link="{path: 'rules'}">
        <img src="/assets/images/point_rule_icon.png">
        <div class="title">积分规则</div>
      </li>
    </ul>
  </div>
  <no-gift v-if="gifts.length == 0"></no-gift>
  <div class="container gift-container" v-if="gifts.length != 0">
    <div v-for="item in gifts">
      <div class="category-name" v-if="item.gifts.length != 0" :class="{'green': $index % 2 == 1, 'orange': $index % 2 == 0}">
        {{item.category.name}}
      </div>
      <gift-item :gifts="item.gifts" v-if="item.gifts.length != 0"></gift-item>
    </div>
  </div>
</template>

<script>
  import { showBackBtn,hideRightBtn,editTitle, getUserPoint, getPointGifts, clearPointGifts } from '../../vuex/actions'
  import giftItem from './giftItem.vue'
  import noGift from './noGift.vue'

  export default {
    vuex:{
      getters:{
        user : state => state.auth.user,
        gifts: state => state.point.gifts,
        score: state => state.point.score
      },
      actions:{
        showBackBtn,
        hideRightBtn,
        editTitle,
        getUserPoint,
        getPointGifts,
        clearPointGifts
      }
    },
    components:{
      giftItem,
      noGift
    },
    route: {
      activate(){
        this.showBackBtn();
        this.hideRightBtn();
        this.editTitle('积分商城');
        //this.getMyPoints(this.user.userId);
        this.getUserPoint();
        this.getPointGifts();
      },
      deactivate() {
        this.clearPointGifts();
      }
    }
  }
</script>

<style scoped>
  .point-tab-box {

  }

  .point-tab {
    float: left;
    width: 33.3%;
    box-sizing: border-box;
    text-align: center;
    background-color: #fff;
    height: 60px;
    border-left: 1px solid #e2e2e2;
    border-bottom: 1px solid #e2e2e2;
  }

  .point-tab:first-child {
    border-left: none;
  }

  .point-tab img {
    width: 25px;
    margin-top: 10px;
  }

  .point-tab .title {
    font-size: 14px;
  }

  .category-name {
    font-size: 14px;
    line-height: 16px;
    margin: 9px 0 10px 0;
    border-left: 5px solid #000;
    padding-left: 6px;
  }

  .category-name.green {
    border-color: #33AA44;
  }

  .category-name.orange {
    border-color: #f98521;
  }

  .my-point {
    color: #FF4E00;
    font-size: 14px;
  }

  .unlogin-tips {
    font-size: 12px;
    color: #db8030;
    background-color: #fff6b8;
    width: 100%;
    height: 30px;
    line-height: 30px;
    padding: 0 2%;
    z-index: 99;
    box-sizing: border-box;
  }

  .unlogin-arrow {
    position: absolute;
    top: 9px;
    right: 2%;
    width: 7px;
    height: 12px;
    background: url('/static/assets/images/unlogin_arrow.png') 0 0 no-repeat;
  }

  .gift-container {
    margin-top: 75px;
  }
</style>
