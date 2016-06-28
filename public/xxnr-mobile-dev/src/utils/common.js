/**
 * Created by songshuang on 2016/6/16.
 */
var URI = require('urijs');
require('urijs/src/URI.fragmentURI.js');
export function getUrlParam(name) {
  var param = window.location.href.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
  if(!param) {
    return false;
  }
  return param[1];
}

export function checkPath(value, str) {
  if(!(value && str)) {
    return 0;
  }
  var url = URI(value);
  URI.fragment = true;
  if(url.pathname() == str){
    return 1;
  }
  return -1;
}

