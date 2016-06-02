import {
  GET_COOKIEUSER,
  GET_USERINFO,
  LOG_OUT
} from '../mutation-types'

// initial state
const state = {
  user: {},
  userInfo:null
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
  [LOG_OUT](state){
    state.user= {},
    state.userInfo = null
  }
}

export default {
  state,
  mutations
}
