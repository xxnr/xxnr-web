/**
 * Created by songshuang on 2016/6/16.
 */
var URI = require('urijs');
require('urijs/src/URI.fragmentURI.js');
export function getUrlParam(name, url) {
  var param = window.location.href.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
  if (url) {
    param = url.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
  }
  
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

export function getStringLen (val, max) {
  var len = 0;
  for (var i = 0; i < val.length; i++) {
    var length = val.charCodeAt(i);
    if(length>=0&&length<=128) {
      len += 1;
    } else {
      len += 2;
    }
    if (max && len > parseInt(max))
      return true;
  }
  if (max)
    return false;
  else
    return len;
}

