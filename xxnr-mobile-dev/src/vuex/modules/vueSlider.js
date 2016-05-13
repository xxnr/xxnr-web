import {
  GET_SLIDERIMAGES
  } from '../mutation-types'

const state= {
  slider: []
}

const mutations = {
  [GET_SLIDERIMAGES] (state, slider) {
    state.slider = slider;
  }
}

export default {
  state,
  mutations
}


