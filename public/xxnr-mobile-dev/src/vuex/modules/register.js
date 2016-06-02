import {
  SET_SENDCODEFORBIDDEN
} from '../mutation-types'

// initial state
const state = {
  forbidSendCode:false
}

// mutations
const mutations = {
  [SET_SENDCODEFORBIDDEN](state){
    state.forbidSendCode = true;
  }
}

export default {
  state,
  mutations
}
