/**
 * Created by pepelu on 2015/9/10.
 */
var app = angular.module('xxnr_common');
app.service('payService', function(BaseUrl){
    var _aliPayUrlBase = BaseUrl + 'alipay?orderId=';
    var _unionPayUrlBase = BaseUrl + 'unionpay?orderId=';

    this.aliPayUrl = function(orderId,payPrice){
        payPriceString = payPrice?"&price="+payPrice:"";
        return _aliPayUrlBase + orderId + payPriceString + '&notifyUrl=/alipay/success';
    };

    this.unionPayUrl = function(orderId,payPrice){
        payPriceString = payPrice?"&price="+payPrice:"";
        return _unionPayUrlBase + orderId + payPriceString +'&notifyUrl=/alipay/success';
    }
});
