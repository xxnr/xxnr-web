
// API for e.g. Mobile application
// This API uses the website
console.log('processing api-v1.0.js');

const XXNR_DIR = "xxnr";

var tools = require('../common/tools');
var services = require('../services');
var UserService = services.user;
var OrderService = services.order;
var ProductService = services.product;
var CartService = services.cart;
var BrandService = services.brand;
var CategoryService = services.category;

exports.install = function() {
	//fix api// F.route('/api/v2.0/getProductDetails/', getProductDetails, ['post', 'get']);
	F.route('/api/v2.0/products/', getProducts, ['post', 'get']);
	F.route('/api/v2.0/products/categories/', getCategories, ['post', 'get']);
	F.route('/api/v2.0/getShoppingCart', getShoppingCart, ['post', 'get'], ['isLoggedIn']);
    F.route('/api/v2.0/updateShoppingCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //fix api// F.route('/api/v2.0/addToCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    F.route('/api/v2.0/shopCart/getShopCartList', getShoppingCart, ['post', 'get'], ['isLoggedIn']);
    F.route('/api/v2.0/shopCart/changeNum', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    F.route('/api/v2.0/shopCart/addToCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
//    F.route('/api/v2.0/product/getGoodsListPage', getGoodsListPage, ['post', 'get']);
    F.route('/api/v2.0/product/getProductsListPage', getGoodsListPage, ['post', 'get']);
//    F.route('/api/v2.0/product/getGoodsDetails', getGoodsDetails, ['post', 'get']);
    // get product detail for web
    F.route('/api/v2.0/product/getProductDetails', getGoodsDetails, ['post', 'get']);
    F.route('/api/v2.0/getShoppingCartOffline', getShoppingCartOffline, ['get', 'post']);
    F.route('/alipay', alipayOrder, ['post', 'get'], ['isLoggedIn', 'isInWhiteList']);
    F.route('/dynamic/alipay/nofity.asp', alipayNotify, ['post','raw']);
    F.route('/unionpay', unionPayOrder, ['post', 'get'], ['isLoggedIn', 'isInWhiteList']);
    F.route('/unionpay/nofity', unionpayNotify, ['post','raw']);
    F.route('/alipay/success', aliPaySuccess);
    // F.route('/notify_alipay.asp', alipayNotify);
    //fix api// F.route('/unionPay', unionPayOrder, ['post', 'get']);
    //fix api// F.route('/unionpay', unionPayOrder, ['post', 'get']);
    // Brands Models Engines etc. attributes
    F.route('/api/v2.0/products/{attributeName}/', getAttributes, ['get']);
    // home page banners
    F.route('/api/v2.0/ad/getAdList', api10_getBanners, ['post', 'get', 'upload'], 8);
    // get product detail for app
    F.route('/api/v2.0/product/getAppProductDetails/', getAppProductDetails, ['post', 'get']);
    // product app info page (app_body app_standard app_support)
    F.route('/product/{productInfo}/{productId}/', view_product_info);

	// v1.0
    //fix api// F.route('/app/shopCart/getShopCartList', getShoppingCart, ['post', 'get']);
    //fix api// F.route('/app/shopCart/changeNum', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //fix api// F.route('/app/shopCart/addToCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
//	F.route('/app/goods/getGoodsListPage', api10_getProducts, ['post', 'get', 'upload'], 8);
	//fix api// F.route('/app/goods/getGoodsDetails', getGoodsDetails, ['post', 'get']);
	F.route('/app/goods/getWebGoodsDetails', api10_getProductDetail, ['post', 'get', 'upload'], 8);
    F.route('/app/ad/getAdList', api10_getBanners, ['post', 'get', 'upload'], 8);
};

var converter = require('../common/converter');
var alipay = require('../configuration/alipay_config').alipay;
var AlipayNotify = require('../configuration/alipay_config').alipayNotify;
var unionPayConfig = require('../configuration/unionPay_config');
var api10 = converter.api10;
var calculatePrice = require('../common/calculator').calculatePrice;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var dri = require('../common/dri');
// console.log('PAYMENTSTATUS=' + JSON.stringify(PAYMENTSTATUS));

function getProducts() {
	var self = this;
	var options = {};
	var category = this.query['category'];
	var userId = this.query.userId;
	var max = this.query['max'];

    var options = {online:{$exists:false}};

	if (category)
		options.category = category;

	var page = this.query.page;

	if (page)
		options.page = page;

	if(max)
		options.max = max;

    ProductService.query(options, function(err, data) {
        if(err){
            self.respond({code:1001, message:'查询失败'});
            return;
        }

        self.respond({'code':"1000", "message":"success",
            "products":api10.convertProducts(data.items),
            "userId": userId,
            "category":category
        });
    });
}

function getGoodsListPage(transformer) {
    var self = this;
	var userId = self.data["locationUserId"];
    var page = self.data["page"];
    var max = self.data["rowCount"] || self.data["max"];
    var category = self.data["classId"];
    var brandName = self.data["brandName"];
    var reservePrice = self.data["reservePrice"];
    var modelName = self.data["modelName"];
    var sort = self.data["sort"];

    var options = {online:{$exists:false}};

	if (category)
		options.category = category;

	if (page)
		options.page = page;

	if (max)
		options.max = max;

    if (brandName)
        options.brandName = decodeURI(brandName).split(',');

    if (reservePrice)
        options.reservePrice = decodeURI(reservePrice).split(',');

    if (modelName)
        options.modelName = decodeURI(modelName).split(',');

    if (sort)
        options.sort = decodeURI(sort);

	// memorize is designed to work with view rather than api
	// Increases the performance (1 minute cache)
	//self.memorize('cache.' + category + '.' + options.page, '1 minute', DEBUG, function() {
		ProductService.query(options, function(err, data) {
			if(err){
				console.log('error occurred while querying products, and the error is ' + err);
                return;
			}

            var products = [];
            var count = data.count;
            var pages = data.pages;
            var page = data.page;

            for(var i = 0; i < data.items.length; i++) {
                var product = api10.convertProduct(data.items[i]);
                var good = {"goodsId":product.id, "awardPoint":"","unitPrice": (product.discountPrice),
                            "goodsGreatCount":(product.positiveRating || 1.0) * 100, "brandId": product.brandId,
                            "brandName": product.brandName, "imgUrl": product.imgUrl,
                            "allowScore": product.payWithScoresLimit,
                            "thumbnail": product.thumbnail,
                            "stock":"100" /*TODO*/,"originalPrice": product.price, "goodsSellCount": 2/*TODO*/,
                            /*"goodsSort":3,*/ "goodsName": product.name,
                            "model": product.model,
                            "presale": product.presale ? product.presale : false,
                            pictures:product.pictures
                        };

                products.push(good);
            }

            var goodsListPage = {"code":"1000","message":"success","datas":{total:count, "rows":products,"pages":pages,"page":page}};

            if(transformer) transformer(goodsListPage);

            self.respond(goodsListPage);
		});
}

function api10_getProducts(){
    var self = this;
	var categary = self.data["classId"];

	if(categary){
		self.data["classId"] = function(categary){
			switch(categary){
				case "49921c468feb4cc6bd69e5de0e1b9e15":
					return "531680A5";
				case "085c3dde0b5e413ab70e5f0a8dfd3c4c":
                    return "6C7D8F66";
				default:
				    return categary;
			}
		}(categary);
	}

    getGoodsListPage.call(this, function(data){
        data["datas"]['locationUserId'] = self.data['locationUserId'];
    });
}

function getProductDetails() {
	var self = this;
	var callbackName = this.query['callback'];

	var options = {};
	options.id = this.query['id'];

	ProductService.get(options, function(err, data) {
        if(err){
            self.respond({code:1001, message:'查询失败'});
            return;
        }

        var response = api10.convertProduct(data);
        self.respond(response);
	});
}

function api10_getProductDetail(){
    var self = this;

    getGoodsDetails.call(this, function(data){
        var transformedData = {};

        for(var i in data){
            if(data.hasOwnProperty(i)){
                transformedData[i] = data[i];
                delete data[i];
            }
        }

        var transformedData = {"code":"1000","message":"success","datas":{"total":1,"rows":[transformedData]},"locationUserId":self.query["locationUserId"]};

        for(var i in transformedData){
            if(transformedData.hasOwnProperty(i)) data[i] = transformedData[i];
        }
    });
}

function getGoodsDetails(transformer){
	var self = this;
	var callbackName = this.query['callback'];

	var options = {};
	options.id = this.data['goodsId'];

	ProductService.get(options, function(err, data) {
        if(err){
            self.respond({code:1001, message:'查询失败'});
            return;
        }

		var product = api10.convertProduct(data);
		var goodDetails = {"code":"1000","message":"success",
		"datas":{"total":1,"rows":[
		]},"locationUserId":self.data["locationUserId"]};

		var goodDetail = {"goodsId": product.id,"goodsHabitatName":null,
    		"recommendedStar":product.stars,
    		"awardPoint":"",
    		"unitPrice": (product.discountPrice),
    		"goodsGreatCount": (product.positiveRating || 1.0) * 100,
    		"imgUrl":product.imgUrl,
            "originalUrl":product.originalUrl,
    		"allowScore": product.payWithScoresLimit,
    		"originalPrice": product.price,
    		"goodsSellCount": 4/*TODO:*/,
    		"comment": null/*TODO:*/,
    		"goodsName": product.name,
            "deposit": product.deposit,
            "description": product.description,
            "productDesc": product.body,
            "standard": product.standard || null,
            "support": product.support || null,
            "goodsAbstract": product.abstract || "",
            "attributes":product.attributes,
            "SKUAttributes":product.SKUAttributes,
            "SKUAdditions":product.SKUAdditions,
            "SKUPrice":product.SKUPrice,
            pictures:product.pictures
            };

        delete product.body;

        for(var i in product){
            if((!goodDetail.hasOwnProperty(i)) && product.hasOwnProperty(i)){
                goodDetail[i] = product[i];
            }
        }

		goodDetails.datas.rows.push(goodDetail);
        var response = goodDetail;

        if(transformer) transformer(response);

		callbackName ? self.jsonp(callbackName, response) : self.json(response);
	});
}

function getAppProductDetails() {
    var self = this;
    if (!self.data['productId']) {
        self.respond({"code":"1001","message":"缺少商品ID"});
        return;
    }
    var host = self.req.uri.host;
    var prevurl = 'http://' + host + '/product/';
    var options = {};
    options.id = self.data['productId'];

    ProductService.get(options, function(err, data) {
        if (err || !data) {
            self.respond({"code":"1001","message":"无法查找到商品"});
            return;
        }
        delete data.body;
        delete data.standard;
        delete data.support;
        if (data.app_body && data.app_body !== '')
            data.app_body_url = prevurl + 'app_body/' + data.id;
        else
            data.app_body_url = '';
        delete data.app_body;

        if (data.app_standard && data.app_standard !== '')
            data.app_standard_url = prevurl + 'app_standard/' + data.id;
        else
            data.app_standard_url = '';
        delete data.app_standard;

        if (data.app_support  && data.app_support !== '')
            data.app_support_url = prevurl + 'app_support/' + data.id;
        else
            data.app_support_url = '';
        delete data.app_support;
        var product = api10.convertProduct(data);

        self.respond({"code":"1000","message":"success","datas":product});
    });
}

// get product info page
function view_product_info(productInfo, productId) {
    var self = this;
    var options = {};
    options.id = productId;

    ProductService.get(options, function(err, data) {
        if (err || !data) {
            self.throw404();
            return;
        }
        var result = {};
        if (productInfo && data[productInfo] && data[productInfo] !== '') {
            if (productInfo === "app_body") {
                result.title = '商品详情' + (data.name ?  (' - ' + data.name) : '');
            } else if (productInfo === "app_standard") {
                result.title = '参数规格' + (data.name ?  (' - ' + data.name) : '');
            } else if (productInfo === "app_support") {
                result.title = '服务说明' + (data.name ?  (' - ' + data.name) : '');
            }
            result.productInfo = data[productInfo];
        } else {
            self.throw404();
            return;
        }
        self.view('productInfoAppTemplate', result);
    });
}

function getCategories(){
	var self = this;
	var callbackName = this.query['callback'];

    CategoryService.all(function(err, categories){
        if(err){
            self.respond({code:1001, message:'fail to query category'});
            return;
        }

        self.respond({code:1000, message:'success', categories:categories});
    });
    //
	//if (!F.global.categories)
	//	F.global.categories = [];
    //
    //var response = api10.convertCategories(F.global.categories, F.global.mapCategories);
	//callbackName ? self.jsonp(callbackName, response) : self.json(response);
}

function getShoppingCart(){
	var self = this;
	var callbackName = this.query['callback'];
	var userId = self.data.userId;
    if(!userId){
        self.jsonp(callbackName, {code:1001, message:'param userId required'});
        return;
    }

    CartService.getOrAdd(userId, function(err, cart){
        if(err){
            self.respond({code:1001, message:'查询购物车失败'});
            return;
        }

        var products = [];
        if(cart.items && cart.items.length>0) {
            cart.items.forEach(function (item) {
                if(item.product) {
                    var product = item.product;
                    product.count = item.count;
                    products.push(product);
                }
            });
        }

        self.respond(convertToShoppingCartFormatV_1_0(products, cart.cartId, cart.userId));
    })
}

function updateShoppingCart() {
    var self = this;
    var callbackName = this.query['callback'];
    var userId = self.data['userId'];
    var goodsId = self.data['goodsId'];
    var count = self.data['quantity'];
    var update_by_add = self.data['update_by_add'];
    if (!userId) {
        var response = {code: 1001, message: 'param userId required'};
        callbackName ? self.jsonp(callbackName, response) : self.json(response);
        return;
    }
    if (!goodsId) {
        var response = ( {code: 1001, message: 'param goodsId required'});
        callbackName ? self.jsonp(callbackName, response) : self.json(response);
        return;
    }
    if (!count) {
        count = self.data['count'];//This is to support addToCart api
        if (!count) {
            var response = {code: 1001, message: 'param quantity/count required'};
            callbackName ? self.jsonp(callbackName, response) : self.json(response);
            return;
        }
    }

    if (parseInt(count) > 9999) {
        self.respond({code: 1001, message: '商品个数不能大于9999'});
        return;
    }

    var options = {};
    options.userId = userId;
    options.goodsId = goodsId;

    CartService.getOrAdd(userId, function (err, cart) {
        if (err) {
            self.respond({code: 1001, message: '获取购物车失败'});
            return;
        }

        ProductService.get({id: goodsId}, function (err, data) {
            if (err || !data) {
                self.respond({"code": "1001", "message": "无法查找到商品"});
                return;
            }

            if (data && data.presale) {
                self.respond({"code": "1001", "message": "无法添加预售商品"});
                return;
            }

            CartService.updateItems(cart.cartId, data._id, count, update_by_add, function (err) {
                if (err) {
                    self.respond({code: 1001, message: '更新购物车失败'});
                    return;
                }

                self.respond({code: 1000, message: 'success'});
            })
        }, false);
    });
}

function payOrder(payExecutor){
    var self = this;
    var callbackName = this.query['callback'];
    var orderId = this.data['orderId'];
    var payPrice = this.data['price'];

    if(!orderId){
        var response = ( {code:1001, message:'param orderId required'});
        callbackName ? self.jsonp(callbackName, response) : self.json(response);
        return;
    }

    // aliPay request creation
    var options = {};
    options.id = orderId;
    OrderService.get(options, function(err, order, payment) {
        if(err) {
            console.error('api-v1.0 payOrder OrderService get err:', err);
            self.respond({code:1001, message:'支付出错'});
            return;
        }

        if(order.isClosed){
            self.respond({code:1001, message:'订单已关闭'});
            return;
        }

        if (!payment || typeof(payment.id) === 'undefined' || typeof(payment.price) === 'undefined') {
            self.respond({code:1001, message:'未找到支付信息'});
            return;
        }

        try {
            // if user not in white list, the price of one time must more than config minPayPrice
            if ((self.user && !self.user.inWhiteList) || !self.user) {
                var minPayPrice = F.config.minPayPrice;
                // one time pay price must more than minPayPrice
                if (minPayPrice > payment.price) {
                    payPrice = payment.price;
                }
                if (payPrice && tools.isPrice(payPrice.toString()) && parseFloat(payPrice) && minPayPrice > parseFloat(payPrice)) {
                    payPrice = minPayPrice;
                }
            }
            OrderService.getPayOrderPaymentInfo(order, payment, payPrice, function (err, resultPayment, resultPayPrice) {
                if (err) {
                    console.error('api-v1.0 payOrder OrderService getPayOrderPaymentInfo err:', err);
                    self.respond({code:1001, message:'获取支付信息出错'});
                    return;
                }
                payExecutor(resultPayment.id, parseFloat(resultPayPrice).toFixed(2), self.ip, order.id);
                return;
            });
        } catch (e) {
            console.error('api-v1.0 payOrder OrderService getPayOrderPaymentInfo err:', e);
            self.respond({"code":1001, "mesage":"获取支付信息出错"});
            return;
        }

        // // user input price is null, not price Regexp, <= 0, > surplus price. use surplus price
        // if (!payPrice || !tools.isPrice(payPrice.toString()) || !parseFloat(payPrice) || parseFloat(payPrice) <= 0 || parseFloat(payPrice) > payment.price) {
        //     payPrice = payment.price;
        //     payExecutor(payment.id, payPrice, self.ip, order.id);
        //     return;
        // } else {
        //     // the price of user input, and equal last time inputted value.
        //     if (payment.payPrice && parseFloat(payment.payPrice) === parseFloat(payPrice)) {
        //         payExecutor(payment.id, payPrice, self.ip, order.id);
        //         return; 
        //     } else {
        //         // the price of user input is a new one, not in the payment and not equal last time inputted value. need push one new payment
        //         var query = {'id':order.id, 'payments.id':payment.id};
        //         var values = {};
        //         var newPayment = payment;
        //         newPayment.id = U.GUID(10);
        //         newPayment.payPrice = parseFloat(payPrice).toFixed(2);
        //         values['$push'] = {'payments':newPayment};
        //         values['$set'] = {'payments.$.isClosed':true};
        //         OrderService.updateAndPushPayment(query, values, function (err) {
        //             if (err) {
        //                 console.error('api-v1.0 payOrder OrderService update and add new payment err:', err);
        //                 self.respond({code:1001, message:'生成支付信息出错'});
        //                 return;
        //             }
        //             payExecutor(newPayment.id, newPayment.payPrice, self.ip, order.id);
        //             return;
        //         });   
        //     }
        // }
    });
}

function alipayOrder(){
    var self = this;
    var consumer = self.data['consumer']||'website';
    payOrder.call(this, function(paymentId, totalPrice, ip) {
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
                    param.notify_url = ((alipay.alipay_config.notify_host || 'http://' + require("node-ip/lib/ip").address('public')) + ":" + alipay.alipay_config.notify_host_port + '/' + alipay.alipay_config.create_direct_pay_by_user_notify_url);
                    param.return_url = ((alipay.alipay_config.return_host || 'http://' + require("node-ip/lib/ip").address('public')) + ":" + alipay.alipay_config.return_host_port + '/' + alipay.alipay_config.create_direct_pay_by_user_return_url);
                    self.view('alipay', alipay.build_direct_pay_by_user_param(param));
                });
                break;
            default:
        }
    });
}

function aliPaySuccess(){
    this.view('alipaySuccess', null);
}

function payNotify(paymentId, options){

    OrderService.get({"paymentId": paymentId}, function(err, order) {
        // TODO: log err
        if (err) {
            console.error('api-v1.0 payNotify OrderService get err:', err);
            dri.sendDRI('[DRI] Fail to get order in order payNotify: ', 'paymentId:'+paymentId, err);
        }
        if (order) {
            if ((order.payStatus||PAYMENTSTATUS.UNPAID) == PAYMENTSTATUS.UNPAID || order.payStatus == PAYMENTSTATUS.PARTPAID) {
                OrderService.paid(order.id, paymentId, options, function(err) {
                    if(err){
                        // if err happen
                        // send sms to dri
                        dri.sendDRI('[DRI] Fail to update order in order payNotify: ', 'orderId:'+order.id, err);
                    }
                }); // SchemaBuilderEntity.prototype.save = function(model, helper, callback, skip)
            }
        }
    });
}

function alipayNotify(){
    var self = this;
    var qs = require('querystring');
    var body = qs.parse(self.body);
    
    AlipayNotify.verifyNotify(body, function(isValid){
        if(!isValid){
            return;
        }

        var paymentId = body.out_trade_no;
        var status = body.trade_status;
        var price = body.total_fee || null;
        if(status == 'TRADE_SUCCESS'){
            var options = {};
            if (price) {
                options.price = price;
            }
            payNotify.call(self, paymentId, options);
        }

        self.content('success');
    })
}

function unionpayNotify(){
    var self = this;

    if(!self.body){
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

    new php_processor(commandLine).execute(function(output, error){
        if(error){
            console.error('unionpayNotify verification failure:', error);
            self.content('verification failure:' + error);
            return;
        }

        var index = 0;
        const BOM = 65279; // include_once utf-8 php will invole BOM

        while(output.charCodeAt(index) == BOM) index++;

        var result = output.substring(index);

        // console.log('result = ' + result + ', and result.length = ' + result.length);

        if(result.substring(0, 'success'.length) === 'success'){
            if(body['respCode'] === 00 || body['respCode'] === '00'){
                var paymentInfo = JSON.parse(new Buffer(body.reqReserved, 'base64').toString());
                var paymentId = paymentInfo.paymentId;
                var options = {price: (parseFloat(paymentInfo.txnAmt)/100).toFixed(2), orderId:paymentInfo.orderId};
                payNotify.call(self, paymentId, options);
                self.content('success');
            }
            else{
                console.error('unionpayNotify error : respCode is ', body['respCode'], 'body:', body);
                self.content('success'); // tell the notifier we successfully handled the notification
            }
        }
        else{
            console.error('unionpayNotify verification failure:', result);
            self.content('verification failure:' + result);
        }
    });
}

function unionPayOrder(){
    // before starting test, we have to enable test account : login http://open.unionpay.com with xxnr 12121312(our test parameters is bound with xxnr)
    //     then go to right top corner => "my test" => "my product" => "not tested" => select one tet type => click "start to test"
    var self = this;
    payOrder.call(this, function(paymentId, totalPrice, ip, orderId){
        var consumer = self.data['consumer']||'website';
        var phpPage = null;

        switch(consumer){
            case 'app':
                phpPage = 'Form_6_2_AppConsume.php';
                break;
            case 'website':
                phpPage = 'Form_6_2_FrontConsume.php';
                break;
            default:
        }


        var host = (unionPayConfig.notification.host||'http://' + require("node-ip/lib/ip").address('public')) + ":" + unionPayConfig.notification.port;
        var frontNotifyUrl = host + '/' + unionPayConfig.notification.front;
        var backNotifyUrl = host + '/' + unionPayConfig.notification.back;
        var php_processor = require("../common/php_processor");
        var commandLine = '\"' + require('path').resolve(__filename + '/../../external/unionPay/upacp_sdk_php/demo/utf8/' + phpPage) + '\"';

        if(F.isDebug){
            commandLine += ' --test';
        }

        commandLine += ` --front-notify-url=${frontNotifyUrl} --back-notify-url=${backNotifyUrl} --payment-id=${paymentId} --total-price=${totalPrice * 100} --order-id=${orderId}`;

        new php_processor(commandLine).execute(function(output, error){
            if(error){
                console.error(error);
            }

            var index = 0;
            const BOM = 65279; // include_once utf-8 php will invole BOM

            while(output.charCodeAt(index) == BOM) index++;

            // console.log(output.substring(index));

            switch(consumer){
                case 'app':
                    var phpResponse = JSON.parse(output.substring(index));
                    var response = phpResponse.response;
                    var qs = require('querystring');
                    response = qs.parse(response);
                    var responseAttributes = ['tn', 'orderId'];

                    for(var i in response){
                        if(response.hasOwnProperty(i)){
                            if(responseAttributes.indexOf(i) < 0){
                                delete response[i];
                            }
                        }
                    }

                    if(self.data['option'] === 'raw-tn'){
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

    /*
    var signature = require("../common/signature");

    var $params = {
        'version' : '5.0.0',               //版本号
        'encoding' : 'utf-8',              //编码方式
        'certId' : unionPayConfig.test.SDK_SIGN_CERT_ID,           //证书ID
        'txnType' : '01',              //交易类型
        'txnSubType' : '01',               //交易子类
        'bizType' : '000201',              //业务类型
        'frontUrl' :  unionPayConfig.test.SDK_FRONT_NOTIFY_URL,        //前台通知地址
        'backUrl' : unionPayConfig.test.SDK_BACK_NOTIFY_URL,       //后台通知地址
        'signMethod' : '01',       //签名方法
        'channelType' : '08',      //渠道类型，07-PC，08-手机
        'accessType' : '0',        //接入类型
        'merId' : '777290058119622',               //商户代码，请改自己的测试商户号
        'orderId' : '201509101025',//new Date().toString('YmdHis'),    //商户订单号
        'txnTime' : '201509101025', //new Date().toString('YmdHis'),    //订单发送时间
        'txnAmt' : '100',      //交易金额，单位分
        'currencyCode' : '156',    //交易币种
        'defaultPayType' : '0001', //默认支付方式
        //'orderDesc' => '订单描述',  //订单描述，网关支付和wap支付暂时不起作用
        'reqReserved' : ' 透传信息', //请求方保留域，透传字段，查询、通知、对账文件中均会原样出现
        };

    s = signature.sign($params, unionPayConfig.test.SDK_SIGN_CERT_PRIVATE_KEY);

    function create_html($params, $action) {
   var $encodeType = $params ['encoding'] || 'UTF-8';
   var $html = `
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=${$encodeType}" />
</head>
<body  onload="javascript:document.pay_form.submit();">
    <form id="pay_form" name="pay_form" action="${$action}" method="post">

`;
    for(var i in $params){
        if($params.hasOwnProperty(i)){
            $html += `    <input type="hidden" name="${i}" id="${i}" value="${$params[i]}" />\n`;
        }
    }
    $html += `
    <input type="submit" type="hidden">
    </form>
</body>
</html>
`;
    return $html;
}
    $html = create_html($params, unionPayConfig.test.SDK_FRONT_TRANS_URL);
    self.raw($html);*/
}


function getBanners(callback){
    var self = this;
    var fs = require('fs');
    var bannerType = self.data['bannerType'] || 'app';
    var bannerFolder = `${XXNR_DIR}/images/banners/` + bannerType;

    var root = require('path').resolve(__filename + `/../../public/` + bannerFolder);
    // console.log('root = ' + root);

    var data = [] , files = fs.readdir(root, function(err, files){
        files.forEach(function(file){
                if(file.indexOf('.jpg') >=0 || file.indexOf('png') >= 0){
                    data.push({"imgUrl":`/${bannerFolder}/${file}`, "id":file, "url":""});
                }
            });

        callback.call(self, data, null);
    });
}

function api10_getBanners(){
    getBanners.call(this, function(data, err){
        data = {"code":"1000","message":"success","datas":{"total":data.length,"rows":data,"locationUserId":""}};
        this.json(data);
    });
}

function getShoppingCartOffline(){
    var self = this;
    var products = JSON.parse(decodeURI(self.data.products));
    if(!products || !Array.isArray(products) || !(products.length > 0)){
        self.respond({code:1001,message:'请提供正确的参数'});
        return;
    }

    ProductService.idJoinWithCount({products: products}, function(err, products){
        if(err){
            self.respond({code:1001,message:err});
        }else {
            self.respond(convertToShoppingCartFormatV_1_0(products, null, null));
        }
    });
}

// return the format that FE need for shopping cart for v1.0
// productDetails: the products Product.idJoinWithCount returns
// cartId: the cart id need to return
// userId: the user id need to return
function convertToShoppingCartFormatV_1_0(productDetails, cartId, userId){
    var goodDetails = {"code":"1000","message":"success",
        "datas":{"total":0, "shopCartId":cartId, "DiscountPrice":0, "locationUserId":userId, "totalPrice":0, "rows":[
        ]}};
    var brands = [];
    var brandNames = [];
    var totalCount = 0;

    for(var i=0; i<productDetails.length; i++) {
        var product = api10.convertProduct(productDetails[i]);
        var goodDetail = {"goodsId": product.id,
            "unitPrice": product.discountPrice,
            "imgUrl": product.thumbnail,
            "productDesc": product.description,
            "point": product.payWithScoresLimit,
            "originalPrice": product.price,
            "goodsName": product.name,
            "deposit": product.deposit,
            "goodsCount":product.count};
        var brandName = product.brandName;
        if(!brands[brandName]){
            brands[brandName] = [];
            brandNames.push(brandName);
        }
        totalCount += parseInt(product.count);
        brands[brandName].push(goodDetail);
    }
    goodDetails.datas.total = productDetails.length;
    goodDetails.datas.totalCount = totalCount;
    for(var brandNameIndex=0; brandNameIndex<brandNames.length; brandNameIndex++) {
        var brand = {"brandName":brandNames[brandNameIndex], "goodsList":brands[brandNames[brandNameIndex]]};
        goodDetails.datas.rows.push(brand);
    }

    return goodDetails;
}

// Get Brands Models Engines etc. attributes
function getAttributes(attributeName) {
    var self = this;
    var category = self.data.category;
    
    // support old app
    if(category == '化肥'){
        category = '531680A5';
    }
    if(category == '汽车'){
        category = '6C7D8F66';
    }

    var brand = self.data.brand;
    if(attributeName == 'brands'){
        // brands is treated as an attribute before
        // we need to check here
        BrandService.query(category, function(err, brands){
            if(err){
                console.error('query brands error', err);
                self.respond({code:1001, message:'获取品牌列表失败', error:err});
                return;
            }

            self.respond({'code': '1000', 'message': 'success', 'datas': brands});
        })
    } else {
        if(attributeName == 'models') attributeName = '车系';
        if(attributeName == 'engines') attributeName = '排量';
        if(attributeName == 'gearboxes') attributeName = '变速箱';
        if(attributeName == 'levels') attributeName = '车型';
        ProductService.getAttributes(category, brand, attributeName, function (err, attributes) {
            if (err) {
                console.error('query attributes error', err);
                self.respond({code: 1001, message: '获取商品属性列表失败', error: err});
                return;
            }

            self.respond({'code': '1000', 'message': 'success', 'datas': attributes.length > 0 ? attributes[0].values || [] : []});
        })
    }
}
