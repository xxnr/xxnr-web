import Vue from 'vue'
import VueResource from 'vue-resource'
import {clearCookie} from '../utils/common'

// HTTP相关
//Vue.http.options.crossOrigin = true;
//Vue.http.options.xhr = {withCredentials: true};
//Vue.http.options.jsonp = {'jsonp': 'callback'};
//Vue.http.options.headers={
//  'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
//};
//// post的时候会把JSON对象转成formdata
//Vue.http.options.emulateJSON=true;

//Docs: https://github.com/vuejs/vue-resource/blob/master/docs/http.md
Vue.use(VueResource);
Vue.http.options.xhr = {withCredentials: true};
export const jsonpGet = (url,params,cb,errCb) => {
  if(typeof data === 'function') {
    errCb = cb;
    cb = params;
    params = null;
  }
  //var options = data ? {params: data} : {};
  Vue.http.jsonp(url,params).then(function(response){
    //console.log(response);
    if(response.data.code == 1401) {
      clearCookie();
    }
    cb(response);
  },errCb);
}

Vue.http.options.emulateJSON=false;
export const jsonpPost = (url,data,cb,errCb) => {
  Vue.http.post(url,data).then(cb,errCb);
}

