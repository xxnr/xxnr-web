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
    jsonpGet(API_ROOT + "api/v2.0/product/getProductDetails", data, cb, errCb);
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
  }
}

