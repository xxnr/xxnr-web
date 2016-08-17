/**
 * Created by songshuang on 2016/8/2.
 */

import {getTime} from '../../utils/common'
import {
  GET_ORDERGIFTDETAIL,
  GET_GIFTORDERDETAIL
} from '../mutation-types.js'

const state = {
  orderGift: {},
  giftOrderDetail: {}
}

const mutations = {
  [GET_ORDERGIFTDETAIL] (state, data) {
    state.orderGift = data;
  },
  [GET_GIFTORDERDETAIL] (state, data) {
    state.giftOrderDetail = data;
  }
}

export default {
  state,
  mutations
}

