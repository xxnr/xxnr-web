import {
  GET_ORDERS_LIST,
  HIDE_POPBOX,
  SHOW_POPBOX,
  SELECT_ORDERSKU,
  CONFIRM_ORDERSKU,
  CONFIRM_ORDER,
  SHOW_SUCCESSTOAST,
  HIDE_SUCCESSTOAST,
  SHOW_FAILURETOAST,
  HIDE_FAILURETOAST,
  RESET_CONFIRMORDER
} from '../mutation-types'

// initial state
const state = {
  ordersList: [],
  popBoxDisplay: false,
  checkedSKUList: [],
  orderSKUList: [],
  confirmOrderId: '',
  hasSKUSelected: false,
  productNumber: 0,
  toastShow: false,
  toastMsg: '',
  failureToast: false,
  successToast: false
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
    state.productNumber = 0;
    state.checkedSKUList = [];
    state.hasSKUSelected = false;
  },
  [SHOW_POPBOX](state, id) {
    state.confirmOrderId = id;
    state.popBoxDisplay = true;
  },
  [SELECT_ORDERSKU](state,index) {
    if(state.checkedSKUList[index]) {
      state.checkedSKUList.$set(index, false);
      state.productNumber -= state.orderSKUList.SKUList[index].count;
      var flag = false;
      for(let i = 0; i < state.checkedSKUList.length; i++) {
        if(state.checkedSKUList[i]) {
          flag = true;
          state.hasSKUSelected = true;
          break;
        }
      }
      if(!flag) {
        state.hasSKUSelected = false;
      }
      return;
    }
    state.checkedSKUList.$set(index, true);
    state.productNumber += state.orderSKUList.SKUList[index].count;
    state.hasSKUSelected = true;
  },
  [SHOW_SUCCESSTOAST] (state) {
    state.successToast = true;
  },
  [HIDE_SUCCESSTOAST] (state) {
    state.successToast = false;
  },
  [SHOW_FAILURETOAST] (state) {
    state.failureToast = true;
  },
  [HIDE_FAILURETOAST] (state) {
    state.failureToast = false;
  },
  [RESET_CONFIRMORDER] (state) {
    state.productNumber = 0;
    state.checkedSKUList = [];
    state.hasSKUSelected = false;
  }
}

export default {
  state,
  mutations
}
