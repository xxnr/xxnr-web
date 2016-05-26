import {
  GET_RSCLISTBYPRODUCT,
  SELECT_RSC,
  CONFIRM_RSC,
  GET_SHOPPINGCART,
  COMMIT_ORDER
} from '../mutation-types'


const state = {
  RSCList: [],
  RSCSelected: [],
  orderRSC: {id: '', address: ''},
  cartList: [],
  totalPrice: 0
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
    state.orderRSC.id = state.RSCList[RSCNum].id;
    var test = window.location.href.match(new RegExp("[\?\&]" + 'id' + "=([^\&]+)", "i"));
    window.location.href = '/#!/order?id=' + test[1];
    //window.history.back();
  },
  [GET_SHOPPINGCART] (state, data) {
    state.cartList = data;
    var totalPrice = 0;
    for(let i = 0; i < data.length; i++) {
      for(let j = 0; j < data[i].SKUList.length; j++) {
        totalPrice += data[i].SKUList[j].price * data[i].SKUList[j].count;
      }
    }
    state.totalPrice = totalPrice;
  },
  [COMMIT_ORDER] (state){
    api.addOrder({
      //shopCartId:,
      //addressId: ,
      //SKUs:,
      //deliveryType:,
      //RSCId: ,
      //consigneePhone: ,
      //consigneeName:

    },response => {

    },response => {

  });
  }
}

export default {
  state,
  mutations
}
