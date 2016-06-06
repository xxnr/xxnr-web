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
    slider[0].url = "javascript:"; //手动设置slider的链接
    slider[1].url = "#!/cars";
    slider[2].url = "#!/huafei";
    state.slider = slider;
  }
}

export default {
  state,
  mutations
}


