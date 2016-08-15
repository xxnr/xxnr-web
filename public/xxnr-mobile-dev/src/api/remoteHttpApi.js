import {API_ROOT} from '../../config'
import {jsonpGet,jsonpPost} from './httpService'

export default {
  getCategories: function (cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.0/products/categories/',null,cb,errCb);
  },
  getIndexProducts: function (params,cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.1/products/',params,cb,errCb);
  },
  getProductsListPage: function (data,cb,errCb) {
    jsonpPost(API_ROOT + "api/v2.1/product/getProductsListPage",data,cb,errCb);
  },
  getPublicKey: function (cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.0/user/getpubkey/',null,cb,errCb);
  },
  login: function (params,cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.0/user/login',params,cb,errCb);
  },
  register: function (params,cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.0/user/register',params,cb,errCb);
  },
  getUserInfo: function (params,cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.0/user/get/',params,cb,errCb);
  },
  getOrdersList: function(params,cb,errCb){
  jsonpGet(API_ROOT + 'api/v2.0/order/getOderList',params,cb,errCb);
  },
  getProductDetail: function(data, cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.0/product/getAppProductDetails", data, cb, errCb);
  },
  getSliderImages: function(cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.0/ad/getAdList", null, cb, errCb);
  },
  sendRegisterCode: function(params,cb,errCb) {
    jsonpGet(API_ROOT + "api/v2.0/sms", params, cb, errCb);
  },
  bindInviter: function(params,cb,errCb) {
    jsonpGet(API_ROOT + "api/v2.0/user/bindInviter", params, cb, errCb);
  },
  querySKUs: function (data, cb, errCb) {
    jsonpPost(API_ROOT + "api/v2.1/SKU/attributes_and_price/query", data, cb, errCb);
  },
  addToCart: function (data, cb, errCb) {
    jsonpPost(API_ROOT + "api/v2.1/cart/addToCart", data, cb, errCb);
  },
  getRSCListByProduct: function (data, cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.2/RSC", data, cb, errCb);
  },
  getShoppingCart: function(cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.1/cart/getShoppingCart", null, cb, errCb);
  },
  addOrder: function(data, cb, errCb) {
    jsonpPost(API_ROOT + "api/v2.1/order/addOrder", data, cb, errCb);
  },
  getConsignee: function(cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.2/user/queryConsignees", null, cb, errCb);
  },
  saveConsignee: function (data, cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.2/user/saveConsignees", data, cb, errCb);
  },
  offlinePay: function (data, cb, errCb) {
    jsonpGet(API_ROOT + "offlinepay", data, cb, errCb);
  },
  getOrderDetail: function (data, cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.0/order/getOrderDetails", data, cb, errCb);
  },
  getDeliveryCode: function (data, cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.2/order/getDeliveryCode", data, cb, errCb);
  },
  confirmOrder: function (data, cb, errCb) {
    jsonpPost(API_ROOT + "api/v2.2/order/confirmSKUReceived", data, cb, errCb);
  },
  getInviter: function (data, cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.0/user/getInviter/", data, cb, errCb);
  },
  sendCode: function (data, cb, errCb) {
    jsonpPost(API_ROOT + "api/v2.3/sms", data, cb, errCb);
  },
  refreshCode: function (data, cb, errCb) {
    jsonpPost(API_ROOT + "api/v2.3/captcha", data, cb, errCb);
  },
  findAccount: function (data, cb, errCb) {
    jsonpGet(API_ROOT + "api/v2.0/user/findAccount", data, cb, errCb);
  },
  getUserPoint: function (cb, errCb) {
    jsonpGet(API_ROOT + 'api/v2.3/rewardshop/get', null, cb, errCb);
  },
  getPointGifts: function (cb, errCb) {
    jsonpGet(API_ROOT + 'api/v2.3/rewardshop/gifts/categories', null, cb, errCb);
  },
  getGiftsByCategory: function (data, cb, errCb) {
    jsonpGet(API_ROOT + 'api/v2.3/rewardshop/gifts', data, cb, errCb);
  },
  getGiftDetail: function (data, cb, errCb) {
    jsonpGet(API_ROOT + 'api/v2.3/rewardshop/gifts/getGiftDetail', data, cb, errCb);
  },
  getPointsLogs: function (data, cb, errCb) {
    jsonpGet(API_ROOT + 'api/v2.3/rewardshop/pointslogs', data, cb, errCb);
  },
  addGiftOrder: function (data, cb, errCb) {
    jsonpPost(API_ROOT + 'api/v2.3/rewardshop/addGiftOrder', data, cb, errCb);
  },
  getGiftOrderList: function (data, cb, errCb) {
    jsonpGet(API_ROOT + 'api/v2.3/rewardshop/getGiftOrderList', data, cb, errCb);
  },
  getGiftOrderDetail: function (data, cb, errCb) {
    jsonpGet(API_ROOT + 'api/v2.3/rewardshop/getGiftOrder', data, cb, errCb);
  }
}

