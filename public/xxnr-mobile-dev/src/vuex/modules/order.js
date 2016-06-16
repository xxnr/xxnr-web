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
  SAVE_CONSIGNEE
} from '../mutation-types'


const state = {
  RSCList: [],
  RSCSelected: [],
  orderRSC: {_id: '', address: ''},
  cartList: [],
  shopCartId: '',
  totalPrice: 0,
  consigneeList: [],
  consigneeSelected: [],
  orderConsignee: {consigneePhone: '', consigneeName: ''},
  orderOfflinePay: {},
  orderInfo: {},
  deliveryCode: ''
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
  [CONFIRM_RSC] (state) {
    var RSCNum = -1;
    for(let i = 0; i < state.RSCSelected.length; i++) {
      if(state.RSCSelected[i]) {
        RSCNum = i;
        break;
      }
    }
    if(RSCNum == -1) {
      alert('请选择自提网点');
      return;
    }
    var address = state.RSCList[RSCNum].RSCInfo.companyAddress;
    state.orderRSC.address = address.province.name + address.city.name + address.county.name + address.town.name + address.details;
    state.orderRSC._id = state.RSCList[RSCNum]._id;
    var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
    window.location.href = '/#!/order?id=' + test[1];
    //window.history.back();
  },
  [GET_SHOPPINGCARTBYSKU] (state, data, id) {
    var sku_id = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
    sku_id = sku_id[1];
    console.log(sku_id);
    var cartData = data;
    var totalPrice = 0;
    var flag_i = false;
    for(let i = 0; i < cartData.length; i++) {
      if(flag_i) {
        break;
      }
      for(let j = 0; j < cartData[i].SKUList.length; j++) {
        if(cartData[i].SKUList[j]._id == sku_id) {
          state.cartList = cartData[i].SKUList[j];
          state.cartList.brandName = cartData[i].brandName;
          state.totalPrice = cartData[i].SKUList[j].price * cartData[i].SKUList[j].count;
          flag_i = true;
          break;
        }
      }
    }
    //state.cartList = data;
    state.shopCartId = id;
  },
  [COMMIT_ORDER] (state, data){
    window.location.href = '/#!/offlinePay?id=' + data.id;
  },
  [GET_CONSIGNEE] (state, data) {
    state.consigneeList = data;
    for(let i = 0; i < state.consigneeList.length; i++) {
      state.consigneeSelected.push(false);
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
    var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
    window.location.href = '/#!/order?id=' + test[1];
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
      var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
      window.location.href = '/#!/order?id=' + test[1];
      //window.history.back();
  },
  [OFFLINE_PAY] (state, data) {
    state.orderOfflinePay = data;
  },
  [GET_ORDERDETAIL] (state, data) {
    state.orderInfo = data;
  },
  [SELF_DELIVERY] (state, data) {
    state.deliveryCode = data;
  }
}

export default {
  state,
  mutations
}
