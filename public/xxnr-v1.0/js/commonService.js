/**
 * Created by pepelu on 2015/9/9.
 */
var app = angular.module('xxnr');
app.service('commonService',function($q,$http,BaseUrl){
    this.baseUrl = BaseUrl;
    this.ajax = function(params){
        var deferred = $q.defer();
        $http({
            method:'JSONP',
            url:BaseUrl+params.methodname+'?callback=JSON_CALLBACK',
            params:params
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(data, error){
            console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + params.methodname + ', and BaseUrl = ' + BaseUrl);
        });
        return deferred.promise;
    };

    // get user id
    // this part should be replaced by a session service that can get the current log on user
    var _user=$.parseJSON(sessionStorage.getItem("user"));
    if(!_user){
        _user={
            userid:'',
            userType:''
        };
    }

    this.user = _user;
    this.accessShoppingCart = function(){
        if(_user!=null&&_user.userid!=null&&_user.userid!=""){
            window.location.href="shoppingCart.html";
        }else{
            window.location.href="login.html";
        }
    };

    this.getParam = function(name) {
        var url = window.location.href;
        var splitIndex = url.indexOf("?") + 1;
        var paramStr = url.substr(splitIndex, url.length);

        var arr = paramStr.split('&');
        for (var i = 0; i < arr.length; i++) {
            var kv = arr[i].split('=');
            if (kv[0] == name) {
                return decodeURIComponent(kv[1]);
            }
        }
        return '';
    };
});