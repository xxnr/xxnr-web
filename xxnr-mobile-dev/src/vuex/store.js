import Vue from 'vue'
import Vuex from 'vuex'
import header from './modules/header'
import sectionTabs from './modules/sectionTabs'
import indexCarsList from './modules/indexCarsList'
import rowsViewProducts from './modules/rowsViewProducts'

import {
  CLOSE_APPDOWNLOAD
} from './mutation-types'
Vue.use(Vuex)
Vue.config.debug = true
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state : {
    showAppDownload: true
  },
  mutations:{
    [CLOSE_APPDOWNLOAD](state){
      state.showAppDownload = false;
    }
  },
  modules: {
    header,sectionTabs,indexCarsList,rowsViewProducts
  },
  strict: debug
})
