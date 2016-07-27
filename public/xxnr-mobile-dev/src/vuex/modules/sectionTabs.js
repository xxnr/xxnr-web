import {
  GET_CATEGORIES
} from '../mutation-types'

// initial state
const state = {
  categories: []
}

// mutations
const mutations = {
  [GET_CATEGORIES](state , categories){
    state.categories = categories;
  }
}

export default {
  state,
  mutations
}
