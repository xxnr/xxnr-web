import {
  GET_ORDERS_LIST
} from '../mutation-types'

// initial state
const state = {
  ordersList: []
}

// mutations
const mutations = {
  [GET_ORDERS_LIST](state,orders){
    state.ordersList = orders;
  }
}

export default {
  state,
  mutations
}
