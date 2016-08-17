/**
 * Created by songshuang on 2016/7/28.
 */

import {getTime} from '../../utils/common'
import {
  GET_USERPOINT,
  GET_POINTGIFTS,
  GET_GIFTSBYCATEGORY,
  GET_GIFTCATEGORIES,
  CLEAR_POINTGIFTS,
  GET_POINTSLOGS,
  GET_GIFTDETAIL,
  GET_GIFTORDERLIST,
  CLEAR_GIFTDETAIL
} from '../mutation-types.js'

const state = {
  score: 0,
  gifts: [],
  logs: [],
  giftDetail: {},
  giftOrderList: {},
  isNull: true
}

const mutations = {
  [GET_USERPOINT] (state, data) {
    state.score = data;
  },
  [GET_POINTGIFTS] (state, data) {
    state.gifts = data;
  },
  [GET_GIFTCATEGORIES] (state, data) { //get all categories
    if (data.length == 0) {
      //TODO
      return;
    }
    var item = {};
    for(let i = 0; i < data.length; i++) {
      item = {};
      item.category = data[i];
      item.gifts = [];
      state.gifts.push(item);
    }
    //console.log(state.gifts)
  },
  [GET_GIFTSBYCATEGORY] (state, index, data) {
    state.gifts[index].gifts = data;
  },
  [CLEAR_POINTGIFTS] (state) {
    state.gifts = [];
    state.score = 0;
  },
  [GET_POINTSLOGS] (state, data) {
    if(!data || data.total == 0) {
      //TODO
    }
    var logs = data;
    for(let i = 0; i < logs.pointslogs.length; i++) {
      if(logs.pointslogs[i].date) {
        logs.pointslogs[i].date = getTime(new Date(logs.pointslogs[i].date), 'yyyy-MM-dd')
      }
    }
    state.logs = logs;
  },
  [GET_GIFTDETAIL] (state, data) {
    state.giftDetail = data;
    state.isNull = false;
  },
  [GET_GIFTORDERLIST] (state, data) {
    if(data.total != 0 && data.giftorders) {
      var resData = data;
      for(let i = 0; i < data.giftorders.length; i++) {
        data.giftorders[i].dateCreated = getTime(new Date(data.giftorders[i].dateCreated), 'yyyy-MM-dd hh:mm')
      }
    }
    state.giftOrderList = data;
  },
  [CLEAR_GIFTDETAIL] (state){
    state.giftDetail = {};
    state.isNull = true;
  }
}

export default {
  state,
  mutations
}
