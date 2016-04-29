import Vue from 'vue'
import Vuex from 'vuex'
import header from './modules/header'

Vue.use(Vuex)
Vue.config.debug = true

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    header
  },
  strict: debug
})
