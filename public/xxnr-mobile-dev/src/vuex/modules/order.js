import {
  GET_RSCLISTBYPRODUCT,
  SELECT_RSC,
  CONFIRM_RSC,
  GET_SHOPPINGCARTBYSKU,
  COMMIT_ORDER,
  GET_CONSIGNEE,
  SELECT_CONSIGNEE,
  CONFIRM_CONSIGNEE,
  OFFLINE_PAY,
  GET_ORDERDETAIL,
  SELF_DELIVERY,
  CONFIRM_ORDERSKU,
  SAVE_CONSIGNEE,
  RESET_ORDERRSC,
  RESET_ORDERCONSIGNEE,
  SELECT_CONSIGNEEAUTO,
  COMMIT_GIFTORDER
  } from '../mutation-types'

import {getUrlParam} from '../../utils/common'

const state = {
  RSCList: [],
  RSCSelected: [],
  orderRSC: {_id: '', address: ''},
  cartList: {},
  shopCartId: '',
  totalPrice: 0,
  consigneeList: [],
  consigneeSelected: [],
  orderConsignee: {consigneePhone: '', consigneeName: ''},
  orderOfflinePay: {},
  orderInfo: {},
  deliveryCode: '',
  additionsTotalPrice: 0
}

const mutations = {
  [GET_RSCLISTBYPRODUCT] (state, data) {
    state.RSCList = data;
    for(let i = 0; i < state.RSCList.length; i++) {
      state.RSCSelected.push(false);
    }
  },
  [SELECT_RSC] (state, index) {
    for(let i = 0; i < state.RSCSelected.length; i++) {
      if(state.RSCSelected[i]) {
        state.RSCSelected.$set(i, false);
        break;
      }
    }
    state.RSCSelected.$set(index, true);
  },
  [CONFIRM_RSC] (state, index) {
    var address = state.RSCList[index].RSCInfo.companyAddress;
    state.orderRSC.address = address.province.name + address.city.name + address.county.name + address.town.name + address.details;
    state.orderRSC._id = state.RSCList[index]._id;
    if(getUrlParam('giftId')) {
      router.go('/giftOrder?giftId=' + getUrlParam('giftId') + '&gift_id=' + getUrlParam('gift_id'));
      return;
    }
    router.go('/order?id=' + getUrlParam('id') + '&count=' + getUrlParam('count') + '&productId=' + getUrlParam('productId'));
    //window.history.back();
  },
  [GET_SHOPPINGCARTBYSKU] (state, data, id) {
    var sku_id = getUrlParam('id');
    var count = getUrlParam('count');
    var cartData = data;
    var totalPrice = 0;
    var additionsTotalPrice = 0;
    var flag_i = false;
    for(let i = 0; i < cartData.length; i++) {
      if(flag_i) {
        break;
      }
      for(let j = 0; j < cartData[i].SKUList.length; j++) {
        if(cartData[i].SKUList[j]._id == sku_id) {
          var item = cartData[i].SKUList[j];
          if(cartData[i].SKUList[j].additions != 0) {
            for(let m = 0 ; m < cartData[i].SKUList[j].additions.length; m++) {
              additionsTotalPrice = Number((cartData[i].SKUList[j].additions[m].price + additionsTotalPrice).toFixed(2));
            }
          }
          state.cartList = item;
          state.cartList.brandName = cartData[i].brandName;
          state.cartList.count = count;
          state.cartList.totalPrice = Number(item.price * count);
          totalPrice = count * (item.deposit ? item.deposit : item.price + additionsTotalPrice);
          flag_i = true;
          break;
        }
      }
    }
    //state.cartList = data;
    state.shopCartId = id;
    state.additionsTotalPrice = additionsTotalPrice;
    state.totalPrice = totalPrice;
  },
  [COMMIT_ORDER] (state, data){
    router.go('/commitPay?id=' + data.id + '&fromOrder=true');
  },
  [GET_CONSIGNEE] (state, data) {
    state.consigneeList = data;
    state.consigneeSelected = [];
    if(state.consigneeList.length == 0) {
      for(let i = 0; i < state.consigneeList.length; i++) {
        state.consigneeSelected.push(false);
      }
    }
  },
  [SELECT_CONSIGNEE] (state, index) {
    for(let i = 0; i < state.consigneeSelected.length; i++) {
      if(state.consigneeSelected[i]) {
        state.consigneeSelected.$set(i, false);
        break;
      }
    }
    state.consigneeSelected.$set(index, true);
  },
  [SAVE_CONSIGNEE] (state, consigneePhone, consigneeName) {
    state.orderConsignee.consigneePhone = consigneePhone;
    state.orderConsignee.consigneeName = consigneeName;

    if(getUrlParam('giftId')) {
      router.go('/giftOrder?giftId=' + getUrlParam('giftId') + '&gift_id=' + getUrlParam('gift_id'));
      return;
    }
    router.go( '/order?id=' + getUrlParam('id') + '&count=' + getUrlParam('count') + '&productId=' + getUrlParam('productId'));
  },
  [CONFIRM_CONSIGNEE] (state, index) {
      var consigneeNum = -1;
      for(let i = 0; i < state.consigneeSelected.length; i++) {
        if(state.consigneeSelected[i]) {
          consigneeNum = i;
          break;
        }
      }
      if(consigneeNum == -1) {
        alert('请选择收货人');
        return;
      }
      state.orderConsignee.consigneePhone = state.consigneeList[consigneeNum].consigneePhone;
      state.orderConsignee.consigneeName = state.consigneeList[consigneeNum].consigneeName;
      console.log(getUrlParam('giftId'));
      if(getUrlParam('giftId')) {
        router.go('/giftOrder?giftId=' + getUrlParam('giftId') + '&gift_id=' + getUrlParam('gift_id'));
        return;
      }

      router.go('/order?id=' + getUrlParam('id') + '&count=' + getUrlParam('count') + '&productId=' + getUrlParam('productId'));
      //window.history.back();
  },
  [OFFLINE_PAY] (state, data) {
    state.orderOfflinePay = data;
  },
  [GET_ORDERDETAIL] (state, data) {
    for(let i = 0; i < data.rows.SKUList.length; i++) {
      if(data.rows.SKUList[i].deliverStatus == 4) {
        data.rows.SKUList[i].isShow = true;
      } else {
        data.rows.SKUList[i].isShow = false;
      }
    }
    state.orderInfo = data;
  },
  [SELF_DELIVERY] (state, data) {
    state.deliveryCode = data;
  },
  [RESET_ORDERCONSIGNEE] (state) {
    state.orderConsignee = {consigneePhone: '', consigneeName: ''};
  },
  [RESET_ORDERRSC] (state) {
    state.orderRSC = {_id: '', address: ''};
    state.RSCSelected = [];
  },
  [SELECT_CONSIGNEEAUTO] (state, data) {
    //if(state.consigneeList.length != 0) {
    //  state.orderConsignee = {consigneePhone: '', consigneeName: ''};
    //  return;
    //}
    var consigneeList = data;
    for(let i = 0; i < consigneeList.length; i++) {
      if(i == 0) {
        state.consigneeSelected.push(true);
        continue;
      }
      state.consigneeSelected.push(false);
    }

    state.orderConsignee.consigneePhone = consigneeList[0].consigneePhone;
    state.orderConsignee.consigneeName = consigneeList[0].consigneeName;
  },
  [COMMIT_GIFTORDER] (state,data) {
    router.go('/giftOrderDone?id=' + data.id + '&giftId=' + data.gift.id);
  }
}

export default {
  state,
  mutations
}
