import {
  SHOW_BACKBUTTON,
  HIDE_BACKBUTTON,
  HIDE_RIGHTBUTTON,
  SHOW_RIGHTBUTTON,
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
  rightButtonDisplay:false,
  rightButtonGoingPath: 'home'
}

// mutations
const mutations = {
  [SHOW_BACKBUTTON](state){
    state.backButtonDisplay = true;
  },
  [HIDE_BACKBUTTON](state){
    state.backButtonDisplay = false;
  },
  [HIDE_RIGHTBUTTON](state){
    state.rightButtonDisplay = false;
  },
  [SHOW_RIGHTBUTTON](state){
    state.rightButtonDisplay = true;
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
