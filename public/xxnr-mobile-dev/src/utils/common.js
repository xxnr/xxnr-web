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

export function getTime(time, mode) {
  Date.prototype.format = function(format)
  {
    var o =
    {
      "M+" : this.getMonth()+1, //month
      "d+" : this.getDate(),    //day
      "h+" : this.getHours(),   //hour
      "m+" : this.getMinutes(), //minute
      "s+" : this.getSeconds(), //second
      "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
      "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)){format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));}
    for(var k in o){
      if(new RegExp("("+ k +")").test(format)){format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));}
    }
    return format;
  }
  return time.format(mode);
}

