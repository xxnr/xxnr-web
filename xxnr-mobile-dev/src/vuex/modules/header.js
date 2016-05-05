import {
  SHOW_BACKBUTTON,
  HIDE_BACKBUTTON
} from '../mutation-types'

// initial state
const state = {
  headerTitle: '新新农人',
  rightButton: 'xxnr',
  backButtonDisplay:false
}

// mutations
const mutations = {
  [SHOW_BACKBUTTON](state){
    state.backButtonDisplay = true;
  },
  [HIDE_BACKBUTTON](state){
    state.backButtonDisplay = false;
  }
}

export default {
  state,
  mutations
}
