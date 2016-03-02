/**
 * Created by pepelu on 2015/10/8.
 */
var app = angular.module('xxnr_common');
app.service('loginService', function($cookieStore, $timeout, BaseUrl, BaseDomainREG, hostnameService){
	var userKey = "__user";
    var tokenKey = "token";
    var scartKey = "__scart";
	var _user = $cookieStore.get(userKey);
    if(!_user){
	    _user={
	        userid:'',
	        userType:''
	    };
    }
    this.user = $cookieStore.get(userKey);
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
        var hostname = hostnameService.getHostname();
        if (BaseDomainREG.test(hostname)) {
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
        // remove shopping cart
        $cookieStore.remove(scartKey, {path:"/", domain:".xinxinnongren.com"});
        $cookieStore.remove(scartKey, {path:"/"});
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