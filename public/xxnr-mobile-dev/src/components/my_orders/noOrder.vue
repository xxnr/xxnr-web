<template>
  <div class="no-order-box">
    <div class="no-order-img"><img src="../../../static/assets/images/blank-space.png" ></div>
    <div class="no-order-wor">
      <p>您还没有订单</p>
      <p>快去挑选心仪的商品吧~</p>
    </div>
    <div class="no-order-btn-box">
      <div class="no-order-btn left-btn"><a v-link="{path: '/huafei'}">去买化肥</a></div>
      <div class="no-order-btn right-btn"><a v-link="{path: '/cars'}">去买汽车</a></div>
    </div>
  </div>
</template>

<script>

</script>

<style>
  .no-order-btn {
    position: absolute;
    width: 80px;
    height: 30px;
    border: 1px solid #00b38a;
    line-height: 30px;
    color: #00b38a;
    background-color: #fff;
    text-align: center;
    border-radius: 5px;
  }

  .no-order-btn a {
    color: #00b38a;
  }

  .no-order-btn-box {
    position: relative;
    width: 200px;
    left: 50%;
    margin-left: -100px;
    margin-top: 20px;
  }

  .no-order-img {
    width: 60px;
    margin: 0 auto;
  }

  .no-order-img img {
    width: 100%;
  }

  .no-order-wor {
    text-align: center;
    font-size: 16px;
    line-height: 25px;
    color: #646464;
    margin-top: 20px;
  }

  .no-order-btn.left-btn {
    left: 0;
  }

  .no-order-btn.right-btn {
    right: 0;
  }

  .no-order-box {
    margin-top: 40%;
  }
</style>
