import Vue from 'vue'
import VueResource from 'vue-resource'
import {API_ROOT} from '../../config'

Vue.use(VueResource);

// HTTP相关
//Vue.http.options.crossOrigin = true;
//Vue.http.options.xhr = {withCredentials: true};
//Vue.http.options.jsonp = {'jsonp': 'callback'};
//Vue.http.options.headers={
//  'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
//};
//// post的时候会把JSON对象转成formdata
//Vue.http.options.emulateJSON=true;
Vue.http.options.xhr = {withCredentials: true};
export default {
  getCategories: function (cb,errCb) {
    Vue.http.jsonp(API_ROOT + 'api/v2.0/products/categories/').then(cb,errCb);
  }
}

