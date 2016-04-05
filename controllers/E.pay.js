
// API for e.g. pay application
const XXNR_DIR = "xxnr";

var tools = require('../common/tools');
var services = require('../services');
var OrderService = services.order;
var PayService = services.pay;
var OFFLINEPAYTYPE = require('../common/defs').OFFLINEPAYTYPE;
var EPOSNotify = MODULE('EPOSNotify');

exports.install = function() {
    // pay
    F.route('/alipay', alipayOrder, ['post', 'get'], ['isInWhiteList', 'throttle']);
    F.route('/unionpay', unionPayOrder, ['post', 'get'], ['isInWhiteList', 'throttle']);
    F.route('/offlinepay', offlinePay, ['get'], ['isLoggedIn']);
    F.route('/EPOSpay', EPOSPay, ['get']);
    // pay notify
    // old url
    F.route('/dynamic/alipay/nofity.asp', alipayNotify, ['post','raw']);
    F.route('/dynamic/alipay/notify.asp', alipayNotify, ['post','raw']);
    // old url
    F.route('/unionpay/nofity', unionpayNotify, ['post','raw']);
    F.route('/unionpay/notify', unionpayNotify, ['post','raw']);
    F.route('/EPOS/notify', process_EPOSNotify, ['post']);
    // offline pay notify
    F.route('/api/v2.2/getOfflinePayType',              json_offline_pay_type, ['get']);
    F.route('/api/v2.2/RSC/confirmOfflinePay',          process_RSC_confirm_OfflinePay, ['get'],    ['isLoggedIn', 'isRSC']);
    // pay refund
    F.route('/dynamic/alipay/refund_fastpay_by_platform_nopwd_notify.asp', alipayRefundNotify, ['post','raw']);
    F.route('/unionpay/refundnotify', unionpayRefundNotify, ['post','raw']);
    // pay success
    F.route('/alipay/success', aliPaySuccess);
    // // test alipay refund
    // F.route('/api/alipay/refund/', refundTest, ['get'], ['isLoggedIn']);
  
};

var alipay = require('../configuration/alipay_config').alipay;
var AlipayNotify = require('../configuration/alipay_config').alipayNotify;
var unionPayConfig = require('../configuration/unionPay_config');
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var dri = require('../common/dri');
var moment = require('moment-timezone');

// pay order

// common pay function
function payOrder(payExecutor){
    var self = this;
    var callbackName = self.query['callback'];
    var orderId = self.data['orderId'];
    var payPrice = self.data['price'];

    if (!orderId) {
        self.respond({code:1001, message:'请提供订单ID'});
        return;
    }

    var options = {};
    options.id = orderId;
    OrderService.get(options, function(err, order, payment) {
        if (err) {
            console.error('api-v1.0 payOrder OrderService get err:', err);
            self.respond({code:1001, message:'支付出错'});
            return;
        }

        if (!order) {
            self.respond({code:1001, message:'未找到订单信息'});
            return;
        }

        if (order.isClosed && order.payStatus === PAYMENTSTATUS.UNPAID) {
            self.respond({code:1001, message:'订单已关闭'});
            return;
        }

        if (!payment || typeof(payment.id) === 'undefined' || typeof(payment.price) === 'undefined') {
            if (order.payStatus === PAYMENTSTATUS.PAID) {
                self.respond({code:1001, message:'订单已支付'});
                return;
            }
            self.respond({code:1001, message:'未找到支付信息'});
            return;
        }

        try {
            if (payPrice) {
                // if user not in white list, the price of one time must more than config minPayPrice
                if ((self.user && !self.user.inWhiteList) || !self.user) {
                    var minPayPrice = F.config.minPayPrice;
                    // one time pay price must more than minPayPrice
                    if (minPayPrice > payment.price) {
                        minPayPrice = payment.price;
                    }
                    // one time pay price must more than minPayPrice
                    if (payPrice && tools.isPrice(payPrice.toString()) && parseFloat(payPrice) && minPayPrice > parseFloat(payPrice)) {
                        payPrice = minPayPrice;
                    }
                }
            }
            var reqOptions = {};
            if (self.payType) {
                reqOptions.payType = self.payType;
            }
            OrderService.getPayOrderPaymentInfo(order, payment, payPrice, reqOptions, function (err, resultPayment, resultPayPrice) {
                if (err) {
                    console.error('api-v1.0 payOrder OrderService getPayOrderPaymentInfo err:', err);
                    self.respond({code:1001, message:'获取支付信息出错'});
                    return;
                }
                payExecutor(resultPayment.id, parseFloat(resultPayPrice).toFixed(2), self.ip, order.id, resultPayment);
                return;
            });
        } catch (e) {
            console.error('api-v1.0 payOrder OrderService getPayOrderPaymentInfo err:', e);
            self.respond({"code":1001, "mesage":"获取支付信息出错"});
            return;
        }
    });
}

function alipayOrder(){
    var self = this;
    var consumer = self.data['consumer']||'website';
    self.payType = PAYTYPE.ZHIFUBAO;

    payOrder.call(this, function(paymentId, totalPrice, ip, orderId, payment) {
        switch(consumer) {
            case 'app':
                var response = {"code":1000, "paymentId":paymentId, "price":totalPrice};
                self.respond(response);
                break;
            case 'website':
                alipay.alipaySubmitService.query_timestamp(function(encrypt_key) {
                    var param = {};
                    param.out_trade_no = paymentId;
                    param.subject = '新新农人';
                    param.total_fee = parseFloat(totalPrice).toFixed(2);
                    param.body = '新新农人服务';
                    param.anti_phishing_key = encrypt_key;
                    param.exter_invoke_ip = ip;
                    // notify_url CANNOT be 127.0.0.1 because ailiy cannot send notification to 127.0.0.1
                    param.notify_url = ((alipay.alipay_config.notify_host || 'http://' + require("node-ip/lib/ip").address('public')) + ":" + alipay.alipay_config.notify_host_port + alipay.alipay_config.create_direct_pay_by_user_notify_url);
                    param.return_url = ((alipay.alipay_config.return_host || 'http://' + require("node-ip/lib/ip").address('public')) + ":" + alipay.alipay_config.return_host_port + alipay.alipay_config.create_direct_pay_by_user_return_url);
                    param.extra_common_param = JSON.stringify({orderId:orderId});
                    self.view('alipay', alipay.build_direct_pay_by_user_param(param));
                });
                break;
            default:
        }
    });
}

function unionPayOrder() {
    // before starting test, we have to enable test account : login http://open.unionpay.com with xxnr 12121312(our test parameters is bound with xxnr)
    //     then go to right top corner => "my test" => "my product" => "not tested" => select one tet type => click "start to test"
    var self = this;
    self.payType = PAYTYPE.UNIONPAY;
    payOrder.call(this, function(paymentId, totalPrice, ip, orderId, payment) {
        var consumer = self.data['consumer']||'website';
        var phpPage = null;

        switch(consumer) {
            case 'app':
                phpPage = 'Form_6_2_AppConsume.php';
                break;
            case 'website':
                phpPage = 'Form_6_2_FrontConsume.php';
                break;
            default:
        }

        var host = (unionPayConfig.notification.host||'http://' + require("node-ip/lib/ip").address('public')) + ":" + unionPayConfig.notification.port;
        var frontNotifyUrl = host + unionPayConfig.notification.front;
        var backNotifyUrl = host + unionPayConfig.notification.back;
        var php_processor = require("../common/php_processor");
        var commandLine = '\"' + require('path').resolve(__filename + '/../../external/unionPay/upacp_sdk_php/demo/utf8/' + phpPage) + '\"';
        var returnPrice = parseFloat((totalPrice * 100).toFixed(2));

        if (F.isDebug) {
            commandLine += ' --test';
        }

        commandLine += ` --front-notify-url=${frontNotifyUrl} --back-notify-url=${backNotifyUrl} --payment-id=${paymentId} --total-price=${returnPrice} --order-id=${orderId}`;

        new php_processor(commandLine).execute(function(output, error) {
            if (error) {
                console.error('unionPayOrder php_processor err:', error);
            }

            var index = 0;
            const BOM = 65279; // include_once utf-8 php will invole BOM

            while (output.charCodeAt(index) == BOM) index++;

            // console.log(output.substring(index));

            switch(consumer) {
                case 'app':
                    var phpResponse = JSON.parse(output.substring(index));
                    var response = phpResponse.response;
                    var qs = require('querystring');
                    response = qs.parse(response);
                    var responseAttributes = ['tn', 'orderId'];

                    for (var i in response) {
                        if (response.hasOwnProperty(i)) {
                            if (responseAttributes.indexOf(i) < 0) {
                                delete response[i];
                            }
                        }
                    }

                    if (self.data['option'] === 'raw-tn') {
                        self.raw(response.tn);
                        break;
                    }

                    self.respond(response);
                    break;
                case 'website':
                    self.raw(output.substring(index));
                    break;
                default:
            }
        }, false);
    });

    return;
}

function offlinePay(){
    var self = this;

    // default offline pay type
    self.payType = PAYTYPE.CASH;

    // forbidden multi pay for offline pay, which means offline pay can only pay off
    self.data.price = null;
    payOrder.call(this, function(paymentId, totalPrice, ip, orderId, payment) {
        OrderService.changeToPendingApprove(orderId, function(err){
            if(err){
                self.respond({code:1002, message:'更改订单状态失败'});
                return;
            }

            self.respond({code:1000, message:'success', "paymentId":paymentId, "price":totalPrice});
        });
    });
}

// pay notify

// common pay notify function
function payNotify(paymentId, options){
    var self = this;

    // order paid
    OrderService.get({"paymentId": paymentId}, function(err, order) {
        // TODO: log err
        if (err) {
            console.error('api-v1.0 payNotify OrderService get err:', err);
            dri.sendDRI('[DRI] Fail to get order in order payNotify: ', 'paymentId:'+paymentId, err);
        }
        if (order) {
            var payment = {paymentId: paymentId};
            if (options && options.price) {
                payment.price = parseFloat(parseFloat(options.price).toFixed(2));
            }
            var result = OrderService.judgePaymentRefund(order, payment);
            if (result && result.refund) {
                var paymentOptions = options;
                paymentOptions.paymentId = paymentId;
                if (!paymentOptions.orderId) {
                    paymentOptions.orderId = order.id;
                }
                if (result.refundReason) {
                    paymentOptions.refundReason = result.refundReason;
                }
                payRefund.call(self, paymentOptions);
            } else {
                if ((order.payStatus||PAYMENTSTATUS.UNPAID) == PAYMENTSTATUS.UNPAID || order.payStatus == PAYMENTSTATUS.PARTPAID) {
                    OrderService.paid(order.id, paymentId, options, function(err, result) {
                        if (err) {
                            if (result && result.refund) {
                                // *TODO refund
                                var paymentOptions = options;
                                paymentOptions.paymentId = paymentId;
                                if (!paymentOptions.orderId) {
                                    paymentOptions.orderId = order.id;
                                }
                                if (result.refundReason) {
                                    paymentOptions.refundReason = result.refundReason;
                                }
                                payRefund.call(self, paymentOptions);
                            } else {
                                console.error('api-v1.0 payNotify OrderService paid err:', err);
                                // if err happen
                                // send sms to dri
                                var idsStr = 'orderId:' + order.id + ' paymentId:' + paymentId;
                                dri.sendDRI('[DRI] Fail to update order in order payNotify: ', idsStr, err);
                            }
                        }
                    }); // SchemaBuilderEntity.prototype.save = function(model, helper, callback, skip)
                }
            }
        } else {
            // not find order by paymentId
            // *TODO refund or other methods
            var paymentOptions = options;
            paymentOptions.paymentId = paymentId;
            if (!paymentOptions.orderId) {
                paymentOptions.orderId = order.id;
            }
            paymentOptions.refundReason = 3;
            payRefund.call(self, paymentOptions);
        }
    });

    // pay success log
    var payLog = options;
    payLog.paymentId = paymentId;
    OrderService.savePaidLog(payLog);
}

// alipay notify function
function alipayNotify() {
    var self = this;
    var qs = require('querystring');
    var body = qs.parse(self.body);
    
    AlipayNotify.verifyNotify(body, function(isValid) {
        if (!isValid) {
            return;
        }

        var paymentId = body.out_trade_no;
        var status = body.trade_status;
        var price = body.total_fee || null;
        if (status == 'TRADE_SUCCESS') {
            var options = {payType:PAYTYPE.ZHIFUBAO, datePaid: new Date()};
            if (price) {
                options.price = price;
            }
            if (body.trade_no) {
                options.queryId = body.trade_no;
            }
            if (body.extra_common_param && body.extra_common_param.length > 0) {
                var extra_common_param = JSON.parse(body.extra_common_param);
                if (extra_common_param && extra_common_param.orderId) {
                    options.orderId = extra_common_param.orderId;
                }
            }
            if (body.notify_time) {
                options.notify_time = body.notify_time;
            }
            payNotify.call(self, paymentId, options);
            self.content('success');
            // // alipay success log
            // var payLog = options;
            // payLog.paymentId = paymentId;
            // OrderService.savePaidLog(payLog);
        } else {
            self.content('success');
        }
        // update the third-party platform payment
        if (status == 'TRADE_SUCCESS' || status == 'WAIT_BUYER_PAY' || status == 'TRADE_FINISHED' || status == 'TRADE_CLOSED') {
            OrderService.updateThirdpartyPayment(paymentId);
        } else {
            console.error('alipayNotify status not find:, status:', status);
        }
    });
}

// unionpay notify function
function unionpayNotify() {
    var self = this;

    if (!self.body) {
        console.error('unionpayNotify cannot get unionpay notification body');
    }

    var qs = require('querystring');
    var body = qs.parse(self.body);

    var php_processor = require("../common/php_processor");
    var commandLine = '\"' + require('path').resolve(__filename + '/../../external/unionPay/upacp_sdk_php/demo/utf8/' + 'Verify.php') + '\"';

    if(F.isDebug){
        commandLine += ' --test';
    }

    commandLine += ` --data=${new Buffer(self.body).toString('base64')} --json=${new Buffer(JSON.stringify(body)).toString('base64')}`;

    new php_processor(commandLine).execute(function(output, error) {
        if (error) {
            console.error('unionpayNotify verification failure:', error);
            self.content('verification failure:' + error);
            return;
        }

        var index = 0;
        const BOM = 65279; // include_once utf-8 php will invole BOM

        while(output.charCodeAt(index) == BOM) index++;

        var result = output.substring(index);

        // console.log('result = ' + result + ', and result.length = ' + result.length);

        if (result.substring(0, 'success'.length) === 'success') {
            if (body['respCode'] === 00 || body['respCode'] === '00') {
                var paymentInfo = JSON.parse(new Buffer(body.reqReserved, 'base64').toString());
                var paymentId = body.orderId || paymentInfo.paymentId;
                var options = {price: (parseFloat(body.txnAmt)/100).toFixed(2), orderId:paymentInfo.orderId, payType:PAYTYPE.UNIONPAY, datePaid: new Date()};
                if (body.txnTime) {
                    options.notify_time = moment(body.txnTime,"YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss");
                }
                if (body.queryId) {
                    options.queryId = body.queryId;
                }
                payNotify.call(self, paymentId, options);
                self.content('success');
                // update the third-party platform payment
                OrderService.updateThirdpartyPayment(paymentId);
                // // unionpay success log
                // var payLog = options;
                // payLog.paymnetId = paymentId;
                // OrderService.savePaidLog(payLog);
            } else {
                console.error('unionpayNotify error : respCode is ', body['respCode'], 'body:', body);
                self.content('success'); // tell the notifier we successfully handled the notification
            }
        } else {
            console.error('unionpayNotify verification failure:', result);
            self.content('verification failure:' + result);
        }
    });
}

// RSC offline pay notify function
function process_RSC_confirm_OfflinePay(){
    var self = this;
    var paymentId = self.data.paymentId;
    var offlinePayType = self.data.offlinePayType;
    var RSC = self.user;
    if(!paymentId){
        self.respond({code:1001, message:'paymentId required'});
        return;
    }

    if(!offlinePayType){
        self.respond({code:1001, message:'offlinePayType required'});
        return;
    }

    OrderService.get({"paymentId": paymentId}, function(err, order) {
        if (err) {
            self.respond({code:1002, message:'获取订单失败'});
            return;
        }

        if(!order.RSCInfo || order.RSCInfo.RSC.toString() != RSC._id.toString()){
            self.respond({code:1002, message:'该订单未分配到县级网点'});
            return;
        }

        if(!order.pendingApprove){
            self.respond({code:1002, message:'该订单没有待审核的线下支付'});
            return;
        }

        var payment = OrderService.getPaymentInOrder(order, paymentId);
        if(!payment){
            self.respond({code:1002, message:'确认付款失败'});
            return;
        }

        var options = {payType:offlinePayType, price:payment.payPrice ? payment.payPrice : payment.price, datePaid:new Date()};

        payNotify.call(self, paymentId, options);
        self.respond({code:1000, message:'success'});
    });
}

function json_offline_pay_type(){
    var self = this;
    self.respond({code:1000, message:'success', offlinePayType:OFFLINEPAYTYPE});
}

// pay refund notify

// alipay refund notify
function alipayRefundNotify() {
    var self = this;
    var qs = require('querystring');
    var body = qs.parse(self.body);
    
    console.log('alipayRefundNotify info:', body);
    AlipayNotify.verifyNotify(body, function(isValid) {
        if (!isValid) {
            self.content('fail');
            return;
        }
        var notify_type = body.notify_type;
        var options = {};
        options.payType = PAYTYPE.ZHIFUBAO;
        options.notify_time = body.notify_time;
        options.notify_id = body.notify_id;
        options.batch_no = body.batch_no;
        options.dateNotify = new Date();
        // return success to alipay
        self.content('success');
        var result_details = body.result_details.split('#');
        if (parseInt(body.success_num) === 1 && result_details && result_details.length === 1) {
            var refundOptions = options;
            refundOptions.success_num = body.success_num;
            refundOptions.result_detail = result_details[0];
            // update payment refund
            PayService.updatePaymentRefund(refundOptions, function(err, result){
                if (err) {
                    console.error('alipayRefundNotify updatePaymentRefund err:', err);
                    return;
                }
            });
        } else {
            for (var i = 0; i < result_details.length; i++) {
                var refundOptions = options;
                refundOptions.success_num = result_details.length;
                refundOptions.result_detail = result_details[i];
                // update payment refund
                PayService.updatePaymentRefund(refundOptions, function(err, result){
                    if (err) {
                        console.error('alipayRefundNotify updatePaymentRefund err:', err);
                        return;
                    }
                });
            }
        }
    });
}

// unionpay refund notify
function unionpayRefundNotify() {
    var self = this;

    if (!self.body) {
        console.error('unionpayNotify cannot get unionpay notification body');
        self.content('unionpayNotify cannot get unionpay notification body');
        return;
    }

    var qs = require('querystring');
    var body = qs.parse(self.body);

    var php_processor = require("../common/php_processor");
    var commandLine = '\"' + require('path').resolve(__filename + '/../../external/unionPay/upacp_sdk_php/demo/utf8/' + 'Verify.php') + '\"';

    if(F.isDebug){
        commandLine += ' --test';
    }

    commandLine += ` --data=${new Buffer(self.body).toString('base64')} --json=${new Buffer(JSON.stringify(body)).toString('base64')}`;

    new php_processor(commandLine).execute(function(output, error) {
        if (error) {
            console.error('unionpayNotify verification failure:', error);
            self.content('verification failure:' + error);
            return;
        }

        var index = 0;
        const BOM = 65279; // include_once utf-8 php will invole BOM

        while(output.charCodeAt(index) == BOM) index++;

        var result = output.substring(index);

        // console.log('result = ' + result + ', and result.length = ' + result.length);

        if (result.substring(0, 'success'.length) === 'success') {
            if (body['respCode'] === 00 || body['respCode'] === '00') {
                self.content('success');
                var paymentInfo = JSON.parse(new Buffer(body.reqReserved, 'base64').toString());
                var refundOptions = {paymentId: body.orderId || paymentInfo.paymentId, notifyPrice: (parseFloat(body.txnAmt)/100).toFixed(2), orderId:paymentInfo.orderId, payType:PAYTYPE.UNIONPAY};
                refundOptions.notify_time = moment(body.txnTime,"YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss");
                refundOptions.queryId = body.origQryId || paymentInfo.queryId;
                refundOptions.notify_id = body.queryId;
                refundOptions.result_detail = paymentInfo;
                refundOptions.dateNotify = new Date();
                // update payment refund
                PayService.updatePaymentRefund(refundOptions, function(err, result){
                    if (err) {
                        console.error('unionpayNotify updatePaymentRefund err:', err);
                        return;
                    }
                });
            } else {
                console.error('unionpayNotify error : respCode is ', body['respCode'], 'body:', body);
                self.content('success'); // tell the notifier we successfully handled the notification
            }
        } else {
            console.error('unionpayNotify verification failure:', result);
            self.content('verification failure:' + result);
        }
    });
}

// var OrderPaidLog = require('../models').orderpaidlog;
// var OrderPaymentsRefund = require('../models').orderpaymentsrefund;
// function refundTest() {
//     var self = this;
//     //var paymentId = '9561ec5220';
//     //var paymentId = '4573828f46';
//     //var paymentId = 'e546c378ca';
//     var paymentId = '3b074a1876';

//     OrderPaymentsRefund.findOne({paymentId: paymentId, payType: 2}, function(err, orderPaymentRefund){
//         if (err) {
//             self.respond('not find refund');
//             return;
//         }
//         self.respond('refund success');
//         if (orderPaymentRefund && orderPaymentRefund.refundReason !== 3) {
//             // TODO refund
//             // console.log(orderPaymentRefund);
//             if (orderPaymentRefund.payType === PAYTYPE.ZHIFUBAO) {
//                 console.log('zhifubao refund:', orderPaymentRefund);
//                //  var type = 'nopwd';
//                //  PayService.alipayRefund(type, orderPaymentRefund, function(err, result) {
//                //     if (err) {
//                //         console.error('payRefund PayService alipayRefundNopwd err:', err);
//                //         return;
//                //     }
//                //     console.log(result);
//                // });
//             } else if (orderPaymentRefund.payType === PAYTYPE.UNIONPAY) {
//                console.log('unionpay refund:', orderPaymentRefund);
//                // PayService.unionpayRefund(orderPaymentRefund, function(err, result) {
//                //      if (err) {
//                //          console.error('payRefund PayService unionpayRefund err:', err);
//                //          return;
//                //      }
//                //      if (result) {
//                //          console.log(result);
//                //      }
//                //      return;
//                // });
//             }
//         }
//     });
// }

// pay refund
function payRefund(options) {
    var self = this;
    if (options) {
        PayService.savePaymentRefund(options, function(err, orderPaymentRefund) {
            if (err) {
                console.error('payRefund PayService save err:', err);
                console.error(orderPaymentRefund);
            } else {
                console.log(orderPaymentRefund);
            }
            // if (orderPaymentRefund && orderPaymentRefund.refundReason !== 3) {
            //     // TODO refund
            //     // console.log(orderPaymentRefund);
            //     if (orderPaymentRefund.payType === PAYTYPE.ZHIFUBAO) {
            //         console.log('zhifubao refund:', orderPaymentRefund);
            //         var type = 'nopwd';
            //         PayService.alipayRefund(type, orderPaymentRefund, function(err, result) {
            //            if (err) {
            //                console.error('payRefund PayService alipayRefundNopwd err:', err);
            //                return;
            //            }
            //            console.log(result);
            //        });
            //     } else if (orderPaymentRefund.payType === PAYTYPE.UNIONPAY) {
            //        // console.log(orderPaymentRefund);
            //        PayService.unionpayRefund(orderPaymentRefund, function(err, result) {
            //             if (err) {
            //                 console.error('payRefund PayService unionpayRefund err:', err);
            //                 return;
            //             }
            //             if (result) {
            //                 console.log(result);
            //             }
            //             return;
            //        });
            //     }
            // }
        });
    }
}

// pay success

// alipay success front page view
function aliPaySuccess(){
    this.view('alipaySuccess', null);
}

function EPOSPay(){
    var self = this;
    self.payType = PAYTYPE.EPOS;
    payOrder.call(this, function(paymentId, totalPrice, ip, orderId, payment) {
        self.respond({code:1000, message:'success', "paymentId":paymentId, "price":totalPrice});
    });
}

function process_EPOSNotify(){
    var self = this;
    var params = self.data.params;
    var signature = self.data.signature;
    console.log(params, signature);
    var decryptedParams = EPOSNotify.decryptParams(params);
    console.log('decrypted params',decryptedParams);
    if(EPOSNotify.verifySignature(decryptedParams, signature)){
        var paymentId = decryptedParams.merchantOrderId;
        var status = decryptedParams.dealStatus;
        var price = decryptedParams.amount || null;
        var orderId = decryptedParams.orderId;
        var datePaid = new Date(decryptedParams.dealDate + ' ' + decryptedParams.dealTime);
        var currentTime = new Date();

        if(status == 1) {
            // paid successfully
            var options = {payType: PAYTYPE.EPOS, price: price, datePaid: datePaid, queryId: orderId, notify_time:currentTime};
            payNotify.call(self, paymentId, options);
        }

        self.respond({orderId:orderId, merchantMsgProcessId:0, merchantMsgProcessTime:currentTime, merchantRecMsgProcessState:1});
    } else{
        console.info('EPOS notify verification fail');
    }
}