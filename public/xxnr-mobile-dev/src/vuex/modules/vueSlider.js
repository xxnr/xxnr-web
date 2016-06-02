import {
  GET_SLIDERIMAGES
  } from '../mutation-types'

const state= {
  slider: []
}

const mutations = {
  [GET_SLIDERIMAGES] (state, slider) {
    for (let obj of slider) {
      obj['img'] = obj['imgUrl'];
      delete obj['imgUrl'];
    }
    state.slider = slider;
  }
}

export default {
  state,
  mutations
}


