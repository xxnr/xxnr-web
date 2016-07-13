import {
  SET_SENDCODEFORBIDDEN,
  HIDE_CODEBOX,
  SHOW_CODEBOX,
  SET_CODEIMG,
  SHOW_CODEIMGLOADING,
  HIDE_CODEIMGLOADING,
  SHOW_CODEIMGERROR,
  HIDE_CODEIMGERROR,
  HIDE_CODEIMG,
  SHOW_CODEIMG,
  SHOW_CODETIPS,
  HIDE_CODETIPS,
  SET_CODETIPS
} from '../mutation-types'

// initial state
const state = {
  forbidSendCode:false,
  isShowBox: false,
  codeImg: '',
  codeImgLoading: false,
  codeImgError: false,
  isNormal: true,
  isLoading: false,
  isError: false,
  hasCodeTips: false,
  codeTips: '',
  captcha: ''
}

// mutations
const mutations = {
  [SET_SENDCODEFORBIDDEN](state){
    state.forbidSendCode = true;
  },
  [HIDE_CODEBOX] (state) {
    state.isShowBox = false;
  },
  [SHOW_CODEBOX] (state) {
    state.isShowBox = true;
  },
  [SET_CODEIMG] (state, data) {
    state.codeImg = data;
  },
  [SHOW_CODEIMGLOADING] (state) {
    state.isLoading = true;
  },
  [HIDE_CODEIMGLOADING] (state) {
    state.isLoading = false;
  },
  [SHOW_CODEIMGERROR] (state) {
    state.isError = true;
  },
  [HIDE_CODEIMGERROR] (state) {
    state.isError = false;
  },
  [HIDE_CODEIMG] (state) {
    state.isNormal = false;
  },
  [SHOW_CODEIMG] (state) {
    state.isNormal = true
  },
  [SHOW_CODETIPS] (state) {
    state.hasCodeTips = true;
  },
  [HIDE_CODETIPS] (state) {
    state.hasCodeTips = false;
  },
  [SET_CODETIPS] (state, data) {
    state.codeTips = data;
  }
}

export default {
  state,
  mutations
}
