import {API_ROOT} from '../../config'
import {jsonpGet} from './httpService'

export default {
  getCategories: function (cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.0/products/categories/',null,cb,errCb);
  },
  getIndexProducts: function (params,cb,errCb) {
    jsonpGet(API_ROOT + 'api/v2.1/products/',params,cb,errCb);
  }
}

