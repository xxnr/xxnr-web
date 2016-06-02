<template>
  <div class="consignee-line">
    <div class="container">
      <div class="consignee-attr">
        收货人
      </div>
      <div class="consignee-val">
        <div class="consignee-val-con">
          <input type="text" placeholder="请填写收货人的真实姓名" maxlength="10" v-model="consigneeName">
        </div>
      </div>
      <div class="clear"></div>
    </div>
  </div>
  <div class="consignee-line">
    <div class="container">
      <div class="consignee-attr">
        手机号
      </div>
      <div class="consignee-val">
        <div class="consignee-val-con">
          <input type="text" placeholder="请填写联系方式" maxlength="11" v-model="consigneePhone">
        </div>
      </div>
      <div class="clear"></div>
    </div>
  </div>
  <div class="consignee-list" v-if="consigneeList">
    <div class="container">
      <div class="consignee-title">
        <img src="/assets/images/history.png">
        &nbsp;&nbsp;&nbsp;历史收货人
      </div>
    </div>
    <ul class="consignee-list-ul">
      <li v-for="consignee in consigneeList">
        <div class="consignee-checked" :class="{'checked ': consigneeSelected[$index]}" @click="selectConsignee($index);"></div>
        <div class="consignee-info">
          {{consignee.consigneeName}}
          {{consignee.consigneePhone}}
        </div>
      </li>
    </ul>
  </div>
  <div class="consignee-confirm" @click="saveConsignee(consigneeName, consigneePhone);">
    确定
  </div>
</template>

<script>
  import { getConsigneeList, saveConsignee, selectConsignee, confirmConsignee } from '../../vuex/actions'

  export default {
    vuex: {
      getters: {
        consigneeList: state => state.order.consigneeList,
        consigneeSelected: state => state.order.consigneeSelected
    },
    actions: {
      getConsigneeList,
      saveConsignee,
      selectConsignee,
      confirmConsignee
    }
  },
  route: {
    activate(transition) {
      this.getConsigneeList();
      transition.next();
    }
  }
  }
</script>

<style scoped>
  .consignee-line {
    line-height: 49px;
    border-bottom: 1px solid #DCDCDC;
    background-color: #fff;
  }

  .consignee-line:first-child {
    border-top: 1px solid #dcdcdc;
    margin-top: 10px;
  }

  .consignee-attr {
    float: left;
    color: #646464;
    font-size: 16px;
    width: 50px;
  }

  .consignee-val {
    position: absolute;
    width: 100%;
    left: 0;
    color: #909090;
    font-size: 16px;
  }

  .consignee-val input[type=text]{
    width:100%;
    height: 49px;
    line-height: 49px;
    font-size: 16px;
    color: #909090;
  }

  .consignee-val-con {
    margin-left: 63px;
    margin-right: 2%;
  }

  .consignee-confirm {
    width: 84%;
    height: 44px;
    line-height: 44px;
    background-color: #00B38A;
    color: #fff;
    font-size: 18px;
    margin-top: 30px;
    border-radius: 5px;
    text-align: center;
    margin-left: 8%;
  }

  .consignee-confirm.disabled {
    background-color: #E0E0E0;
  }

  .consignee-list-ul > li{
    position: relative;
    height: 49px;
    line-height: 49px;
    font-size: 16px;
    padding: 0 2%;
    background-color: #fff;
    border-bottom: 1px solid #dcdcdc;
  }

  .consignee-list-ul > li:first-child {
    border-top: 1px solid #dcdcdc;
  }

  .consignee-checked {
    position: absolute;
    top: 14px;
    left: 2%;
    width: 19px;
    height: 19px;
    background: url('/static/assets/images/consignee-checked.png') 0 0 no-repeat;
  }

  .consignee-info {
    position: absolute;
    left: 2%;
    margin-left: 35px;
  }

  .consignee-title {
    height: 49px;
    line-height: 49px;
    color: #323232;
    font-size: 16px;
  }

  .consignee-title img {
    width: 22px;
    vertical-align: middle;
  }

  .consignee-checked.checked {
    background-position: 0 -19px;
  }
</style>
