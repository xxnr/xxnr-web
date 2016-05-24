/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');
var secure = require('../middlewares/secure');

// front end page
router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '.'+ F.config.directory_xxnr_public + 'index.html'));
});
router.get('/header', function(req, res){res.sendFile(path.join(__dirname, '..' + F.config.directory_xxnr_public + 'header.html'));});
router.get('/footer', function(req, res){res.sendFile(path.join(__dirname, '..' + F.config.directory_xxnr_public + 'footer.html'));});
router.get('/images/:type(small|large|original|thumbnail)/:filename.jpg', controllers.Default.file_image);
router.get('/images/:type(small|large|original|thumbnail)/:category/:filename.jpg', controllers.Default.file_image);

// support old app
router.get('//images/:type(small|large|original|thumbnail)/:filename.jpg', controllers.Default.file_image);
router.get('//images/:type(small|large|original|thumbnail)/:category/:filename.jpg', controllers.Default.file_image);

// pay related views
router.get('/alipay', secure.redirectToHttps, middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.alipayOrder);
router.post('/alipay', secure.redirectToHttps, middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.alipayOrder);
router.get('/alipay/success', controllers.Pay.aliPaySuccess);
router.post('/unionpay/success', controllers.Pay.aliPaySuccess);

module.exports = router;