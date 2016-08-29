<template>
  <div class="point-logs" v-if="logs && logs.length != 0">
    <ul>
      <li class="point-logs-item" v-for="item in logs">
        <div class="point-logs-left">
          <div class="point-logs-method">{{item.event.name}}</div>
          <div class="point-logs-description" v-if="item.description">{{item.description}}</div>
          <div class="point-logs-time">{{item.date}}</div>
        </div>
        <div class="point-logs-right"><span :class="{plus: item.points > 0, minus: item.points < 0}"><span v-if="item.points > 0">+</span>{{item.points}}</span></div>
        <div class="clear"></div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: ['logs']
  }
</script>

<style scoped>
  .point-logs {
    padding-top: 86px;
  }

  .point-logs-item {
    position: relative;
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 10px 2%;
  }

  .point-logs-item:first-child {
    border-top: 1px solid #e0e0e0;
  }

  .point-logs-left {
    float: left;
  }

  .point-logs-right {
    position: absolute;
    font-size: 16px;
    color: #FE9B00;
    line-height: 20px;
    top: 50%;
    margin-top: -10px;
    right: 2%;
  }

  .point-logs-method {
    font-size: 14px;
    line-height: 20px;
  }

  .point-logs-time, .point-logs-description {
    color: #909090;
    font-size: 12px;
    line-height: 20px;
    padding-right: 30px;
  }

  .plus {
    color: #fe9b00;
  }

  .minus {
    color: #909090;
  }
</style>
