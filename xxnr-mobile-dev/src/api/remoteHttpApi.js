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
  }
}

