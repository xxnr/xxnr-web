import {
  SHOW_BACKBUTTON,
  HIDE_BACKBUTTON,
  CHANGE_RIGHTBTN_HOME,
  CHANGE_RIGHTBTN_XXNR,
  CHANGE_RIGHTBTNPATH_HOME,
  CHANGE_RIGHTBTNPATH_MYXXNR,
} from '../mutation-types'

// initial state
const state = {
  headerTitle: '新新农人',
  rightButton: './static/assets/images/header_my_xxnr.png',
  backButtonDisplay:false,
  rightButtonGoingPath: 'my_xxnr'
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
    state.rightButton = './static/assets/images/header_home.png';
  },
  [CHANGE_RIGHTBTN_XXNR](state){
    state.rightButton = './static/assets/images/header_my_xxnr.png';
  },
  [CHANGE_RIGHTBTNPATH_HOME](state){
    state.rightButtonGoingPath = 'home';
  },
  [CHANGE_RIGHTBTNPATH_MYXXNR](state){
    state.rightButtonGoingPath = 'my_xxnr';
  },
}

export default {
  state,
  mutations
}
