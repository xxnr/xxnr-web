import {
  GET_ROWSVIEWCARS,
  GET_ROWSVIEWHUAFEI
} from '../mutation-types'

// initial state
const state = {
  rowsViewCars: [],
  rowsViewHuafei: []
}

// mutations
const mutations = {
  [GET_ROWSVIEWCARS](state , products){
    state.rowsViewCars = products;
  },
  [GET_ROWSVIEWHUAFEI](state , products){
    state.rowsViewHuafei = products;
  }
}

export default {
  state,
  mutations
}
