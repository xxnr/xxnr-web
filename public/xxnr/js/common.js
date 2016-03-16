/**
 * Created by pepelu on 2015/9/9.
 */


/*************************************************************************************************
 **                                    common configuration                                      **
 *************************************************************************************************/
var app = angular.module('xxnr_common', ['ngCookies']);
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
// base domain regx
app.constant('BaseDomainREG', /(.*\.|^)xinxinnongren\.com.*/);

//app.constant('BaseUrl', 'http://101.200.181.247/');
app.constant('BaseUrl', ''); // app.constant('BaseUrl', 'http://123.57.251.173:8070/');

// app.constant('BaseUrl', 'http://127.0.0.1/');
//app.constant('BaseUrl', 'http://127.0.0.1:8070/');
//app.constant('BaseUrl', 'http://192.168.184.1:8070/');


/*************************************************************************************************
 **                                    common service                                            **
 *************************************************************************************************/
app.service('commonService', function($q, $http, BaseUrl, loginService) {
    this.baseUrl = BaseUrl;
    this.ajax = function(params) {
        var deferred = $q.defer();
        var time = new Date().getTime(); // IE8 will cache the request and its response, so we make a different request each time
        $http({
            method: 'JSONP',
            url: BaseUrl + params.methodname + '?time=' + time + '&callback=JSON_CALLBACK',
            params: params
        }).success(function(data) {
            if (data.code == 1401) {
                // Unauthorized
                loginService.logout();
                sweetalert('你已被登出，请重新登录', "logon.html");
            }
            if (data.code == 1429) {
                sweetalert(data.message);
            }
            deferred.resolve(data);
        }).error(function(data, error) {
            console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + params.methodname + ', and BaseUrl = ' + BaseUrl);
        });
        return deferred.promise;
    };

    this.sendPost = function(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: BaseUrl + data.methodname,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }).success(function(data) {
            if (data.code == 1401) {
                // Unauthorized
                loginService.logout();
                sweetalert('你已被登出，请重新登录', "logon.html");
            }
            if (data.code == 1429) {
                sweetalert(data.message);
            }
            deferred.resolve(data);
        }).error(function(data, error) {
            console.error('error = ' + error + ', and data = ' + data + ', and methodname = ' + data.methodname + ', and BaseUrl = ' + BaseUrl);
        });
        return deferred.promise;
    };

    var _user = loginService.user;
    this.user = _user;
    this.accessShoppingCart = function() {
        if (loginService.isLogin) {
            window.location.href = "cart.html";
        } else {
            window.location.href = "logon.html";
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

    var sweetalert = function(alerttext, href_link) {
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
            function() {
                if (href_link) {
                    window.location.href = href_link;
                } else {
                    return false;
                }
            });
        //        }
    };

    this.sweetalert = sweetalert;

    this.parseDate = function(str) {
        return Date.parse(
            str.replace(/-/g, "/").replace('T', ' ').substr(0, str.indexOf('.')) +
            ((str[str.length - 1] >= '0' && str[str.length - 1] <= '9') ? '' : str[str.length - 1]));
    };

});

app.directive('focusMe', function($timeout) {
    return {
        scope: {
            trigger: '@focusMe'
        },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                if (value === "true") {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
        }
    };
});

String.prototype.gblen = function() {
    var len = 0;
    for (var i=0; i<this.length; i++) {
        if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {
            len += 2;
        } else {
            len ++;
        }
    }
    return len;
};

/*************************************************************************************************
 **                                    common controller                                        **
 *************************************************************************************************/

app.controller('needLoginController', function(loginService) {
    // if not login
    if (!loginService.isLogin) {
        window.location.href = "logon.html";
    }
});

/*************************************************************************************************
 **                                    common filter                                             **
 *************************************************************************************************/
app.filter('trustHtml', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    }
});
app.filter('subOrderTypeToChineseWording', function() {
    return function(input) {
        var output = "";
        switch (input) {
            case "deposit":
                output = "订金";
                break;
            case "balance":
                output = "尾款";
                break;
            case "full":
                output = "订单总额";
                break;
            default:
                output = "";
        }
        return input = output;
    };
});
app.filter('payStatusToChineseWording', function() {
    return function(input) {
        var output = "";
        switch (input) {
            case 1:
                output = "待付款";
                break;
            case 2:
                output = "已付款";
                break;
            case 3:
                output = "部分付款";
                break;
            default:
                output = "已关闭";
        }
        return input = output;
    };
});
app.filter('orderTypeToChineseWording', function() {
    return function(input) {
        var output = "";
        switch (input) {
            case 1:
                output = "待付款";
                break;
            case 2:
                output = "已付款";
                break;
            case 3:
                output = "待发货";
                break;
            case 4:
                output = "已发货";
                break;
            case 0:
                output = "已关闭";
                break;
            default:
                output = "";
        }
        return input = output;
    };
});

app.filter('deliverStatusToChineseWording', function() {
    return function(input) {
        var output = "";
        switch (input) {
            case 1:
                output = "待发货";
                break;
            case 2:
                output = "已发货";
                break;
            default:
                output = "其他";
        }
        return input = output;
    };
});

app.filter('payTypeToChineseWording', function() {
    return function(input) {
        var output = "";
        switch (input) {
            case 1:
                output = "支付宝支付";
                break;
            case 2:
                output = "银联支付";
                break;
            default:
                output = "";
        }
        return input = output;
    };
});

app.filter('payStatusToChineseText', function() {
    return function(input) {
        var output = "";
        switch (input) {
            case 1:
                output = "尊敬的客户，我们还未收到该订单的款项，请您尽快完成付款。";
                break;
            case 2:
                output = "尊敬的客户，您的订单还未支付完成，请您尽快完成剩余款项。";
                break;
            case 3:
                output = "尊敬的客户，您的订单已支付完成，请耐心等待卖家发货，如有问题可拨打客服电话联系我们。";
                break;
            case 4:
                output = "尊敬的客户，您的订单商品已部分发货，请您做好收货准备，其他商品请耐心等待发货。";
                break;
            case 5:
                output = "尊敬的客户，您的订单商品已发货，请您做好收货准备。";
                break;
            case 6:
                output = "尊敬的客户，您的订单商品已完成收货，如有问题可拨打客服电话联系我们。";
                break;
            case 0:
                output = "尊敬的客户，您的订单商品已关闭，如有问题可拨打客服电话联系我们。";
                break;
            default:
                output = "";
        }
        return input = output;
    };
});
app.filter('toNumberFixedTwo', function() {
    return function(input) {
        var output = Number(input).toFixed(2);
        return output;
    };
});



/*************************************************************************************************
 **                                    common fix for IE8                                        **
 *************************************************************************************************/
if (!window.console || !console.firebug) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}
Date.fromISO = function(s) {
    var day, tz,
        rx = /^(\d{4}\-\d\d\-\d\d([tT ][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/,
        p = rx.exec(s) || [];
    if (p[1]) {
        day = p[1].split(/\D/);
        for (var i = 0, L = day.length; i < L; i++) {
            day[i] = parseInt(day[i], 10) || 0;
        };
        day[1] -= 1;
        day = new Date(Date.UTC.apply(Date, day));
        if (!day.getDate()) return NaN;
        if (p[5]) {
            tz = (parseInt(p[5], 10) * 60);
            if (p[6]) tz += parseInt(p[6], 10);
            if (p[4] == '+') tz *= -1;
            if (tz) day.setUTCMinutes(day.getUTCMinutes() + tz);
        }
        return day;
    }
    return NaN;
};


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


/*************************************************************************************************
 **                                    common window laction hostname                           **
 *************************************************************************************************/
app.service('hostnameService', function() {
    this.getHostname = function() {
        return window.location.hostname;
    };
});