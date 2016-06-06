import {
  GET_RSCLISTBYPRODUCT,
  SELECT_RSC,
  CONFIRM_RSC,
  GET_SHOPPINGCART,
  COMMIT_ORDER,
  GET_CONSIGNEE,
  SELECT_CONSIGNEE,
  CONFIRM_CONSIGNEE,
  OFFLINE_PAY,
  GET_ORDERDETAIL,
  SELF_DELIVERY,
  CONFIRM_ORDERSKU
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
  [GET_SHOPPINGCART] (state, data, id) {
    state.cartList = data;
    state.shopCartId = id;
    var totalPrice = 0;
    for(let i = 0; i < data.length; i++) {
      for(let j = 0; j < data[i].SKUList.length; j++) {
        totalPrice += data[i].SKUList[j].price * data[i].SKUList[j].count;
      }
    }
    state.totalPrice = totalPrice;
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
