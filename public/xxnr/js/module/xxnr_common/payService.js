/**
 * Created by pepelu on 2015/9/10.
 */
var app = angular.module('xxnr_common');
app.service('payService', function(AliPayUrl){
    var _aliPayUrlBase = AliPayUrl + '?orderId=';

    this.aliPayUrl = function(orderId){
        return _aliPayUrlBase + orderId + '&notifyUrl=my_xxnr.html';
    }
});
