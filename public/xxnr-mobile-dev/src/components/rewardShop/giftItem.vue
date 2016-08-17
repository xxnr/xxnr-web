<template>
  <div class="gift-box" v-for="gift in gifts"  v-link="{path: 'giftDetail?id=' + gift.id}">
    <div class="gift-img">
      <img :src="gift.thumbnail" onerror="javascript:this.src='/static/assets/images/no_picture.png';this.onerror = null;">
    </div>
    <div class="gift-name" :class="{soldout: gift.soldout}">{{gift.name}}</div>
    <div>
      <div class="gift-point" :class="{soldout: gift.soldout}">{{gift.points}}</div>
      <div class="soldout-wor" v-show="gift.soldout">
        已抢光
      </div>
      <div class="clear"></div>
    </div>
  </div>
  <div class="clear"></div>
</template>

<script>
  export default {
    props: ['gifts']
  }
</script>

<style scoped>
  .gift-box {
    position: relative;
    float: left;
    width: 49%;
    background-color: #fff;
    border: 1px solid #c7c7c7;
    box-sizing: border-box;
    margin-bottom: 9px;
    padding: 0 6px;
  }

  .gift-box:nth-child(2n+1) {
    margin-left: 2%;
  }

  .gift-img {
    height: 120px;
    text-align: center;
  }

  .gift-img img {
    width: 120px;
  }

  .gift-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    font-size: 14px;
    line-height: 25px;
  }

  .gift-point {
    float: left;
    color: #FF4E00;
    font-size: 18px;
    line-height: 20px;
    margin: 10px 0;
    background: url('/static/assets/images/integral_normal.png') 0 4px no-repeat;
    padding-left: 15px;
  }

  .soldout {
    color: #a2a2a2;
  }

  .gift-point.soldout {
    background-image: url('/static/assets/images/integral_soldout.png');
  }

  .soldout-wor {
    float: left;
    width: 50px;
    height: 18px;
    line-height: 18px;
    background-color: #f0f0f0;
    color: #a2a2a2;
    text-align: center;
    font-size: 12px;
    border-radius: 2px;
    margin-top: 12px;
    margin-left: 25px;
  }
</style>
