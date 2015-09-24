/**
 * Created by pepelu on 9/17/2015.
 */
var app = angular.module('xxnr',[]);
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
//app.constant('BaseUrl', 'http://101.200.181.247/');
app.constant('BaseUrl', 'http://127.0.0.1:8070/');
app.constant('AliPayUrl', 'http://pay.xinxinnongren.com/alipay');