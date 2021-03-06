import Vue from 'vue'
import Vuex from 'vuex'
import header from './modules/header'
import sectionTabs from './modules/sectionTabs'
import indexCarsList from './modules/indexCarsList'
import rowsViewProducts from './modules/rowsViewProducts'
import auth from './modules/auth'
import myOrders from './modules/myOrders'
import productDetail from './modules/productDetail'
import order from './modules/order'
import vueSlider from './modules/vueSlider'
import register from './modules/register'
import indexConfig from './modules/indexConfig'
import point from './modules/point.js'
import giftOrder from './modules/giftOrder.js'
import {
  CLOSE_APPDOWNLOAD,
  SET_TOASTMSG,
  RESET_TOASTMSG
} from './mutation-types'
Vue.use(Vuex)
Vue.config.debug = true
const debug = process.env.NODE_ENV !== 'production'



const store = new Vuex.Store({
  state : {
    showAppDownload: true,
    toastMsg:""
  },
  mutations:{
    [CLOSE_APPDOWNLOAD](state){
      state.showAppDownload = false;
    },
    [SET_TOASTMSG](state,message){
      state.toastMsg = message;
    },
    [RESET_TOASTMSG](state,data){
      state.toastMsg = "";
    }
  },
  modules: {
    header,
    sectionTabs,
    indexCarsList,
    rowsViewProducts,
    auth,
    myOrders,
    productDetail,
    vueSlider,
    register,
    order,
    indexConfig,
    point,
    giftOrder
  },
  strict: debug
});
export default store
