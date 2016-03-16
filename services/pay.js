/**
 * Created by zhouxin on 2016/03/07.
 */
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var tools = require('../common/tools');
var OrderModel = require('../models').order;
var OrderPaidLog = require('../models').orderpaidlog;
var OrderPaymentsRefund = require('../models').orderpaymentsrefund;
var alipay = require('../configuration/alipay_config').alipay;
var AlipayNotify = require('../configuration/alipay_config').alipayNotify;
var unionPayConfig = require('../configuration/unionPay_config');
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var moment = require('moment-timezone');

// Service
var PayService = function(){};

// save order payments refund
PayService.prototype.savePaymentRefund = function(paymentOptions, callback) {
	try {
      //   if (paymentOptions.payType && paymentOptions.payType === PAYTYPE.ZHIFUBAO) {
    		// if (!paymentOptions.batch_no) {
    		// 	paymentOptions.batch_no = moment(paymentOptions.dateCreated).format("YYYYMMDD") + paymentOptions.paymentId;
    		// }
      //   }
        if (paymentOptions.notify_time) {
            delete paymentOptions.notify_time;
        }
		paymentOptions.dateCreated = new Date();
		var orderPaymentRefund = new OrderPaymentsRefund(paymentOptions);
	    orderPaymentRefund.save(function(err) {
			if (err) {
				console.error('PayService savePaymentRefund save err:', err);
				callback(err, paymentOptions);
				return;
			}
			callback(null, paymentOptions);
		});
	} catch (e) {
        console.error('PayService savePaymentRefund err:', e);
        callback(e, paymentOptions);
    }
};

// update payments refund
PayService.prototype.updatePaymentRefund = function(options, callback) {
	try {
		var query = {};
		var setValues = {status: 1};

        if (options.id) {
            query._id = options.id;
        }
        if (options.backendUser) {
            setValues.backendUser = options.backendUser._id;
            setValues.backendUserAccount = options.backendUser.account;
            setValues.dateSet = new Date();
        }
		
		if (options.payType) {
			query.payType = options.payType;
			if (options.payType === PAYTYPE.ZHIFUBAO) {
                setValues.batch_no = options.batch_no;
				// if (options.batch_no) {
				// 	query.batch_no = options.batch_no;
				// }
				var result_detail_info = options.result_detail.split('^');
				setValues.notifyInfo = options.result_detail;
				if (result_detail_info && result_detail_info.length > 0) {
					query.queryId = result_detail_info[0];
					setValues.notifyPrice = result_detail_info[1];
				}
			}
		}

		if (options.paymentId) {
			query.paymentId = options.paymentId;
		}
		if (options.queryId) {
			query.queryId = options.queryId;
		}
		if (options.notifyPrice) {
			setValues.notifyPrice = options.notifyPrice;
		}
		if (options.notify_id) {
			setValues.notify_id = options.notify_id;
		}
		if (options.notify_time) {
			setValues.notify_time = options.notify_time;
		}
		if (options.result_detail) {
            if (options.result_detail instanceof Object) {
                setValues.notifyInfo = JSON.stringify(options.result_detail);
            } else {
                setValues.notifyInfo = options.result_detail;
            }
		}
		if (options.status) {
			setValues.status = options.status;
		}
        if (options.dateNotify) {
            setValues.dateNotify = options.dateNotify;
        } else {
            if (!options.status || options.status == 1) {
                setValues.dateNotify = new Date();
            }
        }
		OrderPaymentsRefund.update(query, {$set: setValues}, function(err) {
			if (err) {
				console.error('PayService updatePaymentRefund update err:', err);
				console.error('PayService updatePaymentRefund update options:', options);
                callback(err);
			}
            callback(null, options);
		});
	} catch (e) {
        console.error('PayService updatePaymentRefund update err:', e);
        console.error('PayService updatePaymentRefund update options:', options);
        callback(e);
    }
};

// query payment refund
PayService.prototype.queryPaymentRefund = function(options, callback) {

    // options.search {String}
    // options.page {String or Number}
    // options.max {String or Number}

    // page max num
    var pagemax = 50;
    var max = U.parseInt(options.max, 20);
    options.page = U.parseInt(options.page) - 1;
    options.max = max > pagemax ? pagemax : max;

    if (options.page < 0)
        options.page = 0;

    var take = U.parseInt(options.max);
    var skip = U.parseInt(options.page * options.max);

    var query = {};

    if (typeof(options.status) != 'undefined' && options.status != '') {
        query.status = options.status;
    }
    if (options.refundreason) {
        query.refundReason = options.refundreason;
    }

    OrderPaymentsRefund.count(query, function (err, count) {
        if (err) {
            callback(err);
            return;
        }

        OrderPaymentsRefund.find(query, { __v: 0 })
            .sort({dateCreated: -1})
            .skip(skip)
            .limit(take)
            .exec(function (err, docs) {
                if (err) {
                    callback(err);
                    return;
                }

                var data = {};
                data.count = count;
                data.items = docs;

                // Gets page count
                data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);
                if (data.pages === 0)
                    data.pages = 1;
                data.page = options.page + 1;

                // Returns data
                callback(null, data);
            });
    });
};

// Gets a specific payment refund
PayService.prototype.getPaymentRefund = function(options, callback) {
    // options.id {String}

    var self = this;
    if (!options.id) {
        callback('need id');
        return;
    }

    var query = {};

    if (options.id) {
        query._id = options.id;
    }

    OrderPaymentsRefund.findOne(query, function(err, doc) {
        if (err) {
            callback(err);
            return;
        }
        
        // update order paystatus
        if (doc) {
            callback(null, doc.toObject());
            return;
        } else {
            callback(null, null);
        }
    });
};

// alipay refund
PayService.prototype.alipayRefund = function (refundType, options, callback) {
    var self = this;
    if (!refundType) {
        callback('request refund type');
        return;
    }
    if (!options.paymentId) {
    	callback('request paymentId');
    	return;
    }
    if (!options.price) {
    	callback('request price');
    	return;
    }
    if (!options.queryId) {
    	callback('request queryId');
    	return;
    }
    // if (!options.batch_no) {
    // 	callback('request batch_no');
    // 	return;
    // }
    var refundReason = '协议退款';
    if (options.refundReason) {
    	if (options.refundReason == 1) {
    		refundReason = '重复支付';
    	} else if (options.refundReason == 2) {
    		refundReason = '超额支付';
    	} else if (options.refundReason == 3) {
    		refundReason = '未知订单';
    	}
    }

    alipay.alipaySubmitService.query_timestamp(function(encrypt_key) {
        var param = {};
        param.anti_phishing_key = encrypt_key;
        param.refund_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
		param.batch_no = moment(new Date()).format("YYYYMMDD") + options.paymentId;
		param.batch_num = 1;
		param.detail_data = options.queryId + '^' + parseFloat(options.price).toFixed(2) + '^' + refundReason;
        if (refundType && refundType == 'nopwd') {
            // notify_url CANNOT be 127.0.0.1 because ailiy cannot send notification to 127.0.0.1
            param.notify_url = ((alipay.alipay_config.notify_host || 'http://' + require("node-ip/lib/ip").address('public')) + ":" + alipay.alipay_config.notify_host_port + alipay.alipay_config.refund_fastpay_by_platform_nopwd_notify_url);
        
            refundData = alipay.build_refund_fastpay_by_platform_nopwd_param(param);
        
            var httpOptions = {
              hostname: alipay.alipay_config['alipay_api_host'],
              port: 443,
              path: '/gateway.do?' + querystring.stringify(refundData),
              method: 'GET'
            };

            console.log(httpOptions);
            var req = https.request(httpOptions, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    // console.log(chunk);
                    callback(null, chunk);
                });
            });

            req.on('error', function (e) {
                // console.log('problem with request: ', e);
                callback(e);
            });

            req.end();
        } else if (refundType && refundType == 'pwd') {
            // notify_url CANNOT be 127.0.0.1 because ailiy cannot send notification to 127.0.0.1
            param.notify_url = ((alipay.alipay_config.notify_host || 'http://' + require("node-ip/lib/ip").address('public')) + ":" + alipay.alipay_config.notify_host_port + alipay.alipay_config.refund_fastpay_by_platform_pwd_notify_url);
            refundData = alipay.build_refund_fastpay_by_platform_pwd_param(param);
            callback(null, refundData);
        }
    });
};

// unionPay refund
PayService.prototype.unionpayRefund = function (options, callback) {
	var self = this;
    if (!options.paymentId) {
    	callback('request paymentId');
    	return;
    }
    if (!options.price) {
    	callback('request price');
    	return;
    }
    if (!options.queryId) {
    	callback('request queryId');
    	return;
    }
    // before starting test, we have to enable test account : login http://open.unionpay.com with xxnr 12121312(our test parameters is bound with xxnr)
    //     then go to right top corner => "my test" => "my product" => "not tested" => select one tet type => click "start to test"
    var phpPage = 'Form_6_4_Refund.php';
    var host = (unionPayConfig.notification.host||'http://' + require("node-ip/lib/ip").address('public')) + ":" + unionPayConfig.notification.port;
    var refundbackNotifyUrl = host + unionPayConfig.notification.refundback;
    var php_processor = require("../common/php_processor");
    var commandLine = '\"' + require('path').resolve(__filename + '/../../external/unionPay/upacp_sdk_php/demo/utf8/' + phpPage) + '\"';
    var refundPrice = parseFloat((options.price * 100).toFixed(2));

    if (F.isDebug) {
        commandLine += ' --test';
    }

    commandLine += ` --refund-back-notify-url=${refundbackNotifyUrl} --payment-id=${options.paymentId} --total-price=${refundPrice} --order-id=${options.orderId} --query-id=${options.queryId}`;

    new php_processor(commandLine).execute(function(output, error) {
        if (error) {
            console.error('unionPayOrder php_processor err:', error);
        }

        var index = 0;
        const BOM = 65279; // include_once utf-8 php will invole BOM

        while (output.charCodeAt(index) == BOM) index++;

        var phpResponse = JSON.parse(output.substring(index));
        if (phpResponse.response) {
        	callback(null, phpResponse.response);
        } else if (phpResponse.error) {
        	callback(phpResponse.error);
        } else {
            callback(null, phpResponse);
        }
    }, false);
};

module.exports = new PayService();
