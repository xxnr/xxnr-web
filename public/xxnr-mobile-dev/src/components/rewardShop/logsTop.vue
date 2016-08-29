<template>
  <div class="my-point-top-box">
    <div class="my-point-top">
      <div class="container">
        <div>积分 <span class="my-point">{{score}}</span></div>
        <div class="point-tip">快去APP签到领积分啦！</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['score']
  }
</script>

<style>
  .my-point {
    color: #FF4E00;
    font-size: 14px;
  }

  .point-tip {
    font-size: 12px;
    color: #646464;
  }

  .my-point-top {
    padding-top: 8px;
    height: 67px;
    border-bottom: 1px solid #E0E0E0;
    background-color: #fff;
  }

  .my-point-top div {
    line-height: 30px;
  }

  .my-point-top-box {
    position: fixed;
    width: 100%;
  }
</style>
