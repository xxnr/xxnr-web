<template>
  <div class="log-tab-box">
    <ul class="log-tab-ul">
      <li class="left-tab" v-link="{path: '/pointsLogs/unComplete'}" :class="{checked: currentTab == 1}">未完成</li>
      <li class="right-tab" v-link="{path: '/pointsLogs/completed'}" :class="{checked: currentTab == 2}">已完成</li>
      <li class="tab-line"></li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: ['currentTab']
  }
</script>

<style>
  .log-tab-ul {
    position: fixed;
    width: 100%;
    height: 49px;
    background-color: #fff;
    top: 44px;
    left: 0;
    z-index: 99;

  }

  .log-tab-ul li {
    position: absolute;
    width: 50%;
    font-size: 18px;
    text-align: center;
    line-height: 48px;
  }

  .log-tab-ul li.checked {
    color: #00b38a;
    border-bottom: 2px solid #00b38a;
  }

  .log-tab-ul .left-tab {
    left: 0;
  }

  .log-tab-ul .right-tab {
    right: 0;
  }

  .log-tab-ul .tab-line {
    position: absolute;
    width: 0;
    border-left: 1px solid #c7c7c7;
    height: 30px;
    top: 9px;
    left: 50%;
  }
</style>
