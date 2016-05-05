import Vue from 'vue'
import VueResource from 'vue-resource'

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
  Vue.http.jsonp(url,params).then(cb,errCb);
}

Vue.http.options.emulateJSON=false;
export const jsonpPost = (url,data,cb,errCb) => {

  Vue.http.post(url,data).then(cb,errCb);
}

