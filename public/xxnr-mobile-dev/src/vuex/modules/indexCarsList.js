import {
  GET_INDEXCARS,
  GET_INDEXHUAFEI
} from '../mutation-types'

// initial state
const state = {
  indexCars: [],
  indexHuafei: [],
}

// mutations
const mutations = {
  [GET_INDEXCARS](state , products){
    state.indexCars = products;
  },
  [GET_INDEXHUAFEI](state , products){
    state.indexHuafei = products;
  }
}

export default {
  state,
  mutations
}
