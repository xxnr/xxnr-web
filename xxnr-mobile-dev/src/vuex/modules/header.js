import {
  SHOW_BACKBUTTON,
  HIDE_BACKBUTTON,
  CHANGE_RIGHTBTN_HOME,
  CHANGE_RIGHTBTN_XXNR
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
  },
  [CHANGE_RIGHTBTN_HOME](state){
    state.rightButton = 'home';
  },
  [CHANGE_RIGHTBTN_XXNR](state){
    state.rightButton = 'xxnr';
  },
}

export default {
  state,
  mutations
}
