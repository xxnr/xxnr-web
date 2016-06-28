import {
  GET_COOKIEUSER,
  GET_USERINFO,
  LOG_OUT,
  GET_INVITERINFO,
  CLEAR_INVITER
} from '../mutation-types'

// initial state
const state = {
  user: {},
  userInfo:null,
  inviterInfo: {}
}

// mutations
const mutations = {
  [GET_COOKIEUSER](state,user){
    state.user = user;
  },
  [GET_USERINFO](state,userInfo){
    //console.log(user);
    state.userInfo = userInfo;
  },
  [GET_INVITERINFO](state, inviterInfo) {
    state.inviterInfo = inviterInfo;
  },
  [LOG_OUT](state){
    state.user= {},
    state.userInfo = null
  },
  [CLEAR_INVITER](state) {
    state.inviterInfo = {};
    console.log('clear');
  }
}

export default {
  state,
  mutations
}
