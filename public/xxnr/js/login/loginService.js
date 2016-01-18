/**
 * Created by pepelu on 2015/10/8.
 */
var app = angular.module('xxnr_common');
app.service('loginService', function($cookieStore, $timeout, BaseUrl, BaseDomainREG){
	var userKey = "__user";
    var tokenKey = "token";
	var _user = $cookieStore.get(userKey);
    if(!_user){
	    _user={
	        userid:'',
	        userType:''
	    };
    }
    this.user = _user;
    //console.log(this.user);
//    var refresh = function(){
//        var expires = new Date();
//        expires.setMinutes(expires.getMinutes()+5);
//        $cookies.put(userKey, $cookies.get(userKey), {expires: expires.toUTCString(), path:"/"});
//        return _user;
//    };

    this.getUser = function() {
        return $cookieStore.get(userKey);
    };

    this.setUser = function(value) {
        if (BaseDomainREG.test(BaseUrl)) {
            $cookieStore.put(userKey, value, {path:"/", domain:".xinxinnongren.com"});
        } else {
            $cookieStore.put(userKey, value, {path:"/"});
        }
    };

    this.logout = function(){
//        $cookies.remove(userKey, {path:"/"});
        $cookieStore.remove(userKey, {path:"/", domain:".xinxinnongren.com"});
        $cookieStore.remove(tokenKey, {path:"/", domain:".xinxinnongren.com"});
        $cookieStore.remove(userKey, {path:"/"});
        $cookieStore.remove(tokenKey, {path:"/"});
    };

    this.isLogin = (function(){
        if(_user){
            if(_user.userid && _user.userid != ''){
                return true;
            }
        }

        return false;
    })();
});