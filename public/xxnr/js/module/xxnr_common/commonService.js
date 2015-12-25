/**
 * Created by pepelu on 2015/9/9.
 */
var app = angular.module('xxnr_common');
app.service('commonService',function($q,$http,BaseUrl,loginService){
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

    var _user = loginService.user;
    this.user = _user;
    this.accessShoppingCart = function(){
        if(_user!=null&&_user.userid!=null&&_user.userid!=""){
            window.location.href="cart.html";
        }else{
            window.location.href="logon.html";
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