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
    state.rowsViewCars = products.rows;
  },
  [GET_ROWSVIEWHUAFEI](state , products){
    state.rowsViewHuafei = products.rows;
  }
}

export default {
  state,
  mutations
}
