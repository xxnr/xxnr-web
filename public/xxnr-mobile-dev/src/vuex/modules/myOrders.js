import {
  GET_ORDERS_LIST,
  HIDE_POPBOX,
  SHOW_POPBOX,
  SELECT_ORDERSKU,
  CONFIRM_ORDERSKU,
  CONFIRM_ORDER
} from '../mutation-types'

// initial state
const state = {
  ordersList: [],
  popBoxDisplay: false,
  checkedSKUList: [],
  orderSKUList: [],
  confirmOrderId: ''
}

// mutations
const mutations = {
  [GET_ORDERS_LIST](state,orders){
    state.ordersList = orders;
  },
  [CONFIRM_ORDERSKU] (state, data) {
    for(let i = 0; i < data.SKUList.length; i++) {
      state.checkedSKUList.push(false);
    }
    state.orderSKUList = data;
  },
  [HIDE_POPBOX](state) {
    state.popBoxDisplay = false;
  },
  [SHOW_POPBOX](state, id) {
    state.confirmOrderId = id;
    state.popBoxDisplay = true;
  },
  [SELECT_ORDERSKU](state,index) {
    //for(let i = 0; i < state.checkedSKUList.length; i++) {
    //  if(state.checkedSKUList[i]) {
    //    state.checkedSKUList.$set(i, false);
    //    break;
    //  }
    //}
    if(state.checkedSKUList[index]) {
      state.checkedSKUList.$set(index, false);
      return;
    }
    state.checkedSKUList.$set(index, true);
  },
  [CONFIRM_ORDER] (state) {

  }
}

export default {
  state,
  mutations
}
