<template>
  <ul class="rsc-list">
    <li v-for="rsc in RSCList">
      <div class="container">
        <div class="rsc-list-name">
          {{rsc.RSCInfo.companyName}}
        </div>
        <div class="rsc-list-info">
          地址：
          {{rsc.RSCInfo.companyAddress.province.name}}
          {{rsc.RSCInfo.companyAddress.city.name}}
          {{rsc.RSCInfo.companyAddress.county.name}}
          {{rsc.RSCInfo.companyAddress.town.name}}
          {{rsc.RSCInfo.companyAddress.details}}
        </div>
        <div class="rsc-list-info">
          电话：{{rsc.RSCInfo.phone}}
        </div>
        <div class="rsc-list-radio" :class="{'checked ': RSCSelected[$index]}" @click="selectRSC($index);">

        </div>
      </div>
    </li>
  </ul>
  <div v-for="item in "></div>
  <div class="rsc-confirm">
    <div class="rsc-confirm-btn" @click="RSCConfirm();">
      确定
    </div>
  </div>
</template>

<script>
  import { getRSCListByProduct, selectRSC, RSCConfirm } from '../../vuex/actions'

  export default {
    vuex: {
      getters: {
        RSCList: state => state.order.RSCList,
        RSCSelected: state => state.order.RSCSelected
    },
      actions: {
        getRSCListByProduct,
        selectRSC,
        RSCConfirm
      }
    },
    route: {
      activate(transition) {
        var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
        //this.getRSCListByProduct(test[1]);
        this.getRSCListByProduct('570db646f2c135e878f078e5');
        transition.next();
      }
      //var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
    }
  }
</script>

<style scoped>
  .rsc-list > li {
    position: relative;
    border-bottom: 1px solid #c7c7c7;
    padding: 10px 0 10px 30px;
    background-color: #fff;
  }

  .rsc-list-radio {
    position: absolute;
    background: url('/static/assets/images/rsc_radio.png') 0 -18px no-repeat;
    width: 18px;
    height: 18px;
    top: 37px;
    left: 12px;
  }

  .rsc-list-radio.checked {
    background-position: 0 0;
  }

  .rsc-list-name {
    font-size: 16px;
    color: #323232;
  }

  .rsc-list-info {
    font-size: 14px;
    color: #646464;
  }

  .rsc-confirm {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 49px;
    border-top: 1px solid #c7c7c7;
    background-color: #fff;
  }

  .rsc-confirm-btn {
    width: 90px;
    height: 30px;
    line-height: 30px;
    color: #fff;
    background-color: #FE9B00;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    margin-top: -15px;
    left: 50%;
    margin-left: -45px;
    font-size: 16px;
    text-align: center;
  }
</style>
