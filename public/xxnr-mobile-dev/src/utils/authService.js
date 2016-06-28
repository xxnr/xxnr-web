import cookie from 'react-cookie'
import { domain } from '../../config.js'
let cookieConfig = {}
if(domain !== ''){
  cookieConfig = { domain: domain }
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
    that.toastMessage = "你已在其他地方登录,请重新登录"
  }
}
