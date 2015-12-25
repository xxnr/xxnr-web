/**
 * Created by pepelu on 2015/9/9.
 */

 
/*************************************************************************************************
**                                    common configuration                                      **
*************************************************************************************************/
var app = angular.module('xxnr_common',['ngCookies']);
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
//app.constant('BaseUrl', 'http://101.200.181.247/');
app.constant('BaseUrl', 'http://www.xinxinnongren.com/'); // app.constant('BaseUrl', 'http://123.57.251.173:8070/');

// app.constant('BaseUrl', 'http://127.0.0.1/');
//app.constant('BaseUrl', 'http://127.0.0.1:8070/');
//app.constant('BaseUrl', 'http://192.168.184.1:8070/');


/*************************************************************************************************
 **                                    common service                                            **
 *************************************************************************************************/
app.service('commonService',function($q,$http,BaseUrl,loginService){
    this.baseUrl = BaseUrl;
    this.ajax = function(params){
        var deferred = $q.defer();
        var time = new Date().getTime(); // IE8 will cache the request and its response, so we make a different request each time
        $http({
            method:'JSONP',
            url:BaseUrl+params.methodname+'?time=' + time + '&callback=JSON_CALLBACK',
            params:params
        }).success(function(data){
            if(data.code == 1401){
                // Unauthorized
                loginService.logout();
                sweetalert('你已被登出，请重新登录', window.location.href);
            }
            deferred.resolve(data);
        }).error(function(data, error){
            console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + params.methodname + ', and BaseUrl = ' + BaseUrl);
        });
        return deferred.promise;
    };

    var _user = loginService.user;
    this.user = _user;
    this.accessShoppingCart = function(){
        if(loginService.isLogin){
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

    var sweetalert = function(alerttext, href_link){
//        if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i)=="8."){
//            alert(alerttext);
//            if (href_link) {
//                window.location.href = href_link;
//            } else {
//                return false;
//            }
//        }else {
        swal({
                title: "新新农人",
                text: alerttext,
                //type: "info",
                // showCancelButton: true,
                confirmButtonColor: '#00913a',
                confirmButtonText: '确定',
                closeOnConfirm: true
            },
            function () {
                if (href_link) {
                    window.location.href = href_link;
                } else {
                    return false;
                }
            });
//        }
    };

    this.sweetalert = sweetalert;

    this.parseDate = function(str){
        return Date.parse(
            str.replace(/-/g,"/").replace('T',' ').substr(0, str.indexOf('.'))
            +
            ((str[str.length-1]>='0' && str[str.length-1]<='9')? '':str[str.length-1]));
    };

});

app.directive('focusMe', function($timeout) {
    return {
        scope: { trigger: '@focusMe' },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                if(value === "true") {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
        }
    };
});

/*************************************************************************************************
 **                                    common controller                                        **
 *************************************************************************************************/

app.controller('needLoginController', function(loginService){
    // if not login
    if(!loginService.isLogin) {
        window.location.href = "logon.html";
    }
});

/*************************************************************************************************
 **                                    common filter                                             **
 *************************************************************************************************/
app.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
});


/*************************************************************************************************
**                                    common fix for IE8                                        **
*************************************************************************************************/
if (!window.console || !console.firebug){
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}


/*************************************************************************************************
**                                    common fix for baidu tongji                                        **
*************************************************************************************************/
var _hmt = _hmt || [];
(function() {
    var hm = document.createElement("script");
    hm.src = "//hm.baidu.com/hm.js?b0c0d94a1b72b7f3ee9bffe74a7dad93";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();
