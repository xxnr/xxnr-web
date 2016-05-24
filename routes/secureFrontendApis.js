/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');
var secure = require('../middlewares/secure');

router.get('/unionpay', secure.redirectToHttps, middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.unionPayOrder);
router.post('/unionpay', secure.redirectToHttps, middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.unionPayOrder);
router.get('/offlinepay', secure.redirectToHttps, controllers.Pay.offlinePay);
router.get('/EPOSpay', secure.redirectToHttps, middleware.isInWhiteList_middleware, controllers.Pay.EPOSPay);
router.post('/dynamic/alipay/nofity.asp', secure.redirectToHttps, controllers.Pay.alipayNotify);
router.post('/dynamic/alipay/notify.asp', secure.redirectToHttps, controllers.Pay.alipayNotify);
router.post('/unionpay/nofity', secure.redirectToHttps, controllers.Pay.unionpayNotify);
router.post('/unionpay/notify', secure.redirectToHttps, controllers.Pay.unionpayNotify);
router.post('/EPOS/notify', secure.redirectToHttps, controllers.Pay.process_EPOSNotify);
router.get('/api/v2.2/RSC/confirmOfflinePay', secure.redirectToHttps, middleware.isLoggedIn_middleware, middleware.isRSC_middleware, controllers.Pay.process_RSC_confirm_OfflinePay);
router.post('/dynamic/alipay/refund_fastpay_by_platform_nopwd_notify.asp', secure.redirectToHttps, controllers.Pay.alipayRefundNotify);
router.post('/unionpay/refundnotify', secure.redirectToHttps, controllers.Pay.unionpayRefundNotify);

module.exports = router;