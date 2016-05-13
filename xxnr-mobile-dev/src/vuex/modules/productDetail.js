import {
    GET_PRODUCTDETAIL
  } from '../mutation-types'

const state= {
  product: {}
}

const mutations = {
  [GET_PRODUCTDETAIL] (state, product) {
    state.product = product;
  }
}

export default {
  state,
  mutations
}


