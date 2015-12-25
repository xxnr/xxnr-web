/**
 * Created by pepelu on 9/17/2015.
 */
var app = angular.module('xxnr_common',['ngCookies']);
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
//app.constant('BaseUrl', 'http://101.200.181.247/');
//app.constant('BaseUrl', 'http://123.57.251.173:8070/');
//app.constant('AliPayUrl', 'http://123.57.251.173:8070/alipay/');

app.constant('BaseUrl', 'http://127.0.0.1:8070/');
app.constant('AliPayUrl', 'http://127.0.0.1:8070/alipay/');