var config = {
    partner:'2088911973097354' //合作身份者id，以2088开头的16位纯数字
    ,key:'o11oiidrjq70z8zfrvj6785b46xtpkkv'//MD5 key
    ,ali_pub_key:'-----BEGIN PUBLIC KEY-----' + '\r\n' +
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnxj/9qwVfgoUh/y2W89L6BkRA' + '\r\n' +
        'FljhNhgPdyPuBV64bfQNN1PjbCzkIM6qRdKBoLPXmKKMiFYnkd6rAoprih3/PrQE' + '\r\n' +
        'B/VsW8OoM8fxn67UDYuyBTqA23MML9q1+ilIZwBC2AQ2UBVOrFXfFl75p6/B5Ksi' + '\r\n' +
        'NG9zpgmLCUYuLkxpLQIDAQAB' + '\r\n' +
        '-----END PUBLIC KEY-----'
    ,seller_email:'it@xinxinnongren.com' //卖家支付宝帐户 必填 
    // ,host:'http://123.57.251.173:8070/'
	,notify_host:'http://www.xinxinnongren.com' // public address for host
	,notify_host_port:80
	,return_host:'http://www.xinxinnongren.com' // public address for host
	,return_host_port:80
	,cacert:'cacert.pem'//ca证书路径地址，用于curl中ssl校验 
	,transport:'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
	,input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8	
	,create_direct_pay_by_user_return_url : '/alipay/success'
	,create_direct_pay_by_user_notify_url: 'dynamic/alipay/nofity.asp'	
	,input_charset:'UTF-8'//字符编码格式 目前支持 gbk 或 utf-8
	,sign_type:"MD5"//签名方式 不需修改
};

var Alipay = require('alipay').Alipay;
var AlipayNotify = require('alipay').AlipayNotify;

exports.alipay = new Alipay(config);
exports.alipayNotify = new AlipayNotify(config);
