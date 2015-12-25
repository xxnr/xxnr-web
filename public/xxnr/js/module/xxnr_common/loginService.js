/**
 * Created by pepelu on 2015/10/8.
 */
var app = angular.module('xxnr_common');
app.service('loginService', function($cookies, $timeout){
	var userKey = "__user";
	var _user = $cookies.getObject(userKey);
    if(!_user){
	    _user={
	        userid:'',
	        userType:''
	    };
    }
    this.user = _user;

//    var refresh = function(){
//        var expires = new Date();
//        expires.setMinutes(expires.getMinutes()+5);
//        $cookies.put(userKey, $cookies.get(userKey), {expires: expires.toUTCString(), path:"/"});
//        return _user;
//    };

    this.logout = function(){
    	$cookies.remove(userKey, {path:"/"});
    }
});