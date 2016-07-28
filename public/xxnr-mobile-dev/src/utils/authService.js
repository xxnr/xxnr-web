import cookie from 'react-cookie'
let config = require('../../config.js')
let cookieConfig = {}
if(config.domain !== ''){
  cookieConfig = { domain: config.domain }
}

export function saveCookie(name,value) {
  cookie.save(name, value, cookieConfig)
}

export function getCookie(name) {
  return cookie.load(name)
}

export function removeCookie(name) {
  cookie.remove(name, cookieConfig)
}

export function signOut() {
  cookie.remove('token', cookieConfig)
}

export function isLogin() {
  return !!cookie.load('token')
}

export function checkOtherPlaceLogin(res,that){
  if(res.data.code==1401){
    that.toastShow= true;
    that.toastMessage = "你已在其他地方登录,请重新登录";
    router.go('/login');
  }
}
