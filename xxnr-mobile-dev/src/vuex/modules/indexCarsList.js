import {
  GET_INDEXCARS
} from '../mutation-types'

// initial state
const state = {
  indexCars: []
}

// mutations
const mutations = {
  [GET_INDEXCARS](state , products){
    state.indexCars = products;
  }
}

export default {
  state,
  mutations
}
