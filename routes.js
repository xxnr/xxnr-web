/**
 * Created by pepelu on 2016/4/11.
 */
var express = require('express');
var router = express.Router();
var controllers = require('./controllers');
var path = require('path');
var middleware = require('./middlewares/authentication');

// front end page
router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './public/xxnr/index.html'));
});
router.get('/header', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/header.html'));});
router.get('/footer', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/footer.html'));});
router.get('/images/:type(small|large|original|thumbnail)/:filename.jpg', controllers.Default.file_image);
router.get('/images/:type(small|large|original|thumbnail)/:category/:filename.jpg', controllers.Default.file_image);

// view render pages


//// app related pages
router.get('/product/:productInfo/:productId/',controllers.Api_v1_0.view_product_info);
router.get('/news/:id/',controllers.News.view_news_detail);
router.get('/sharenews/:id/',controllers.News.view_newsshare_detail);

// area address APIs
router.get('/api/v2.0/area/getAreaList', controllers.Area.json_province_query);
router.post('/api/v2.0/area/getAreaList', controllers.Area.json_province_query);
router.get('/api/v2.0/area/getAreaCity', controllers.Area.json_city_query);
router.post('/api/v2.0/area/getAreaCity', controllers.Area.json_city_query);
router.get('/api/v2.0/area/getAreaCounty', controllers.Area.json_county_query);
router.post('/api/v2.0/area/getAreaCounty', controllers.Area.json_county_query);
router.get('/api/v2.0/area/getAreaTown', controllers.Area.json_town_query);
router.post('/api/v2.0/area/getAreaTown', controllers.Area.json_town_query);

// v1.0 area APIs
router.get('/api/v2.0/businessDistrict/getBusinessByAreaId', controllers.Area.json_city_query);
router.post('/api/v2.0/businessDistrict/getBusinessByAreaId', controllers.Area.json_city_query);
router.get('/api/v2.0/build/getBuildByBusiness', controllers.Area.json_county_query);
router.post('/api/v2.0/build/getBuildByBusiness', controllers.Area.json_county_query);

// old APIs
router.get('/api/v2.0/products', controllers.Api_v1_0.getProducts);
router.post('/api/v2.0/products', controllers.Api_v1_0.getProducts);
router.get('/api/v2.0/products/categories', controllers.Api_v1_0.getCategories);
router.post('/api/v2.0/products/categories', controllers.Api_v1_0.getCategories);
router.get('/api/v2.0/getShoppingCart', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getShoppingCart);
router.post('/api/v2.0/getShoppingCart', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getShoppingCart);
router.get('/api/v2.0/updateShoppingCart', middleware.isLoggedIn_middleware, controllers.Api_v1_0.updateShoppingCart);
router.post('/api/v2.0/updateShoppingCart', middleware.isLoggedIn_middleware, controllers.Api_v1_0.updateShoppingCart);
router.get('/api/v2.0/shopCart/changeNum', middleware.isLoggedIn_middleware, controllers.Api_v1_0.updateShoppingCart);
router.post('/api/v2.0/shopCart/changeNum', middleware.isLoggedIn_middleware, controllers.Api_v1_0.updateShoppingCart);
router.get('/api/v2.0/shopCart/addToCart', middleware.isLoggedIn_middleware, controllers.Api_v1_0.updateShoppingCart);
router.post('/api/v2.0/shopCart/addToCart', middleware.isLoggedIn_middleware, controllers.Api_v1_0.updateShoppingCart);
router.get('/api/v2.0/shopCart/getShopCartList', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getShoppingCart);
router.post('/api/v2.0/shopCart/getShopCartList', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getShoppingCart);
router.get('/api/v2.0/product/getProductsListPage', controllers.Api_v1_0.getGoodsListPage);
router.post('/api/v2.0/product/getProductsListPage', controllers.Api_v1_0.getGoodsListPage);
router.get('/api/v2.0/product/getProductDetails', controllers.Api_v1_0.getGoodsDetails);
router.post('/api/v2.0/product/getProductDetails', controllers.Api_v1_0.getGoodsDetails);
router.get('/api/v2.0/getShoppingCartOffline', controllers.Api_v1_0.getShoppingCartOffline);
router.post('/api/v2.0/getShoppingCartOffline', controllers.Api_v1_0.getShoppingCartOffline);
router.get('/api/v2.0/products/:attributeName', controllers.Api_v1_0.getAttributes);
router.get('/api/v2.0/ad/getAdList', controllers.Api_v1_0.api10_getBanners);
router.post('/api/v2.0/ad/getAdList', controllers.Api_v1_0.api10_getBanners);
router.get('/app/ad/getAdList', controllers.Compatibility.processV10AppCall, controllers.Api_v1_0.api10_getBanners);
router.post('/app/ad/getAdList', controllers.Compatibility.processV10AppCall, controllers.Api_v1_0.api10_getBanners);
router.get('/api/v2.0/product/getAppProductDetails', controllers.Api_v1_0.getAppProductDetails);
router.post('/api/v2.0/product/getAppProductDetails', controllers.Api_v1_0.getAppProductDetails);
router.get('/api/v2.0/getMinPayPrice', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getMinPayPrice);
router.post('/api/v2.0/getMinPayPrice', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getMinPayPrice);
router.post('/api/v2.1/ISOupgrade', controllers.Api_v1_0.ISOUpgrade);

// order APIs
router.get('/api/v2.0/order/getOderList', middleware.isLoggedIn_middleware, controllers.Order.getOrders);
router.post('/api/v2.0/order/getOderList', middleware.isLoggedIn_middleware, controllers.Order.getOrders);
router.get('/api/v2.0/order/getAppOrderList', middleware.isLoggedIn_middleware, controllers.Order.api10_getOrders);
router.post('/api/v2.0/order/getAppOrderList', middleware.isLoggedIn_middleware, controllers.Order.api10_getOrders);
router.get('/api/v2.0/order/addOrder', middleware.isLoggedIn_middleware, middleware.throttle, controllers.Order.addOrder);
router.post('/api/v2.0/order/addOrder', middleware.isLoggedIn_middleware, middleware.throttle, controllers.Order.addOrder);
router.get('/api/v2.0/order/getOrderDetails', middleware.isLoggedIn_middleware, controllers.Order.api10_getOrderDetails);
router.post('/api/v2.0/order/getOrderDetails', middleware.isLoggedIn_middleware, controllers.Order.api10_getOrderDetails);
router.get('/api/v2.0/order/updateOrderPaytype', middleware.isLoggedIn_middleware, controllers.Order.updateOrderPaytype);
router.post('/api/v2.0/order/updateOrderPaytype', middleware.isLoggedIn_middleware, controllers.Order.updateOrderPaytype);
router.get('/api/v2.0/order/confirmeOrder', middleware.isLoggedIn_middleware, controllers.Order.confirmOrder);
router.post('/api/v2.0/order/confirmeOrder', middleware.isLoggedIn_middleware, controllers.Order.confirmOrder);
router.post('/api/v2.1/order/addOrder', middleware.isLoggedIn_middleware, middleware.throttle, controllers.Order.addOrderBySKU);
router.post('/api/v2.2/order/confirmSKUReceived', middleware.isLoggedIn_middleware, controllers.Order.process_confirm_SKU_received);
router.get('/api/v2.2/order/getDeliveryCode', middleware.isLoggedIn_middleware, controllers.Order.json_get_delivery_code);

// v1.0 order APIs
router.get('/app/order/getOderList', middleware.isLoggedIn_middleware, controllers.Order.api10_getOrders);
router.post('/app/order/getOderList', middleware.isLoggedIn_middleware, controllers.Order.api10_getOrders);

// Vcod
router.get('/api/v2.0/sms', controllers.VCode.generate_sms);
router.post('/api/v2.0/sms', controllers.VCode.generate_sms);

// news APIs
router.get('/api/v2.0/news', controllers.News.json_news_query);
router.get('/api/v2.0/news/categories', controllers.News.json_news_categories);
router.get('/api/v2.0/news/:id', controllers.News.json_news_read);

// product APIs
router.get('/api/v2.1/brands', controllers.Product.getBrands);
router.get('/api/v2.1/products', controllers.Product.json_products_get);
router.get('/api/v2.1/product/getProductsListPage', controllers.Product.getProductsListPage);
router.post('/api/v2.1/product/getProductsListPage', controllers.Product.getProductsListPage);
router.get('/api/v2.1/products/attributes', controllers.Product.json_products_attributes);
router.post('/api/v2.1/SKU/attributes_and_price/query', controllers.Product.json_SKU_Attributes_query);
router.get('/api/v2.1/SKU/get', controllers.Product.json_SKU_get);

// cart APIs
router.get('/api/v2.1/cart/getShoppingCart', middleware.isLoggedIn_middleware, controllers.Cart.getShoppingCart);
router.post('/api/v2.1/cart/addToCart', middleware.isLoggedIn_middleware, controllers.Cart.updateShoppingCart);
router.post('/api/v2.1/cart/changeNum', middleware.isLoggedIn_middleware, controllers.Cart.updateShoppingCart);
router.post('/api/v2.1/cart/getShoppingCartOffline', controllers.Cart.getShoppingCartOffline);
router.post('/api/v2.2/cart/getDeliveries', middleware.isLoggedIn_middleware, controllers.Cart.getSKUDeliveries);

// user APIs
router.get('/api/v2.0/user/login', controllers.User.process_login);
router.post('/api/v2.0/user/login', controllers.User.process_login);
router.get('/api/v2.0/user/getpubkey', controllers.User.json_public_key);
router.post('/api/v2.0/user/getpubkey', controllers.User.json_public_key);
router.get('/api/v2.0/user/register', controllers.User.process_register);
router.post('/api/v2.0/user/register', controllers.User.process_register);
router.get('/api/v2.0/user/get', middleware.isLoggedIn_middleware, controllers.User.json_user_get);
router.post('/api/v2.0/user/get', middleware.isLoggedIn_middleware, controllers.User.json_user_get);
router.get('/api/v2.0/user/resetpwd', controllers.User.process_resetpwd);
router.post('/api/v2.0/user/resetpwd', controllers.User.process_resetpwd);
router.get('/api/v2.0/user/modifypwd', middleware.isLoggedIn_middleware, controllers.User.json_user_modifypwd);
router.post('/api/v2.0/user/modifypwd', middleware.isLoggedIn_middleware, controllers.User.json_user_modifypwd);
router.get('/api/v2.0/user/modify', middleware.isLoggedIn_middleware, controllers.User.json_user_modify);
router.post('/api/v2.0/user/modify', middleware.isLoggedIn_middleware, controllers.User.json_user_modify);
router.get('/api/v2.0/point/findPointList', middleware.isLoggedIn_middleware, controllers.User.json_userscore_get);
router.post('/api/v2.0/point/findPointList', middleware.isLoggedIn_middleware, controllers.User.json_userscore_get);
router.get('/api/v2.0/user/findAccount', controllers.User.json_user_findaccount);
router.post('/api/v2.0/user/findAccount', controllers.User.json_user_findaccount);
router.get('/api/v2.0/user/bindInviter', middleware.isLoggedIn_middleware, controllers.User.process_bind_inviter);
router.post('/api/v2.0/user/bindInviter', middleware.isLoggedIn_middleware, controllers.User.process_bind_inviter);
router.get('/api/v2.0/user/getInviter', middleware.isLoggedIn_middleware, controllers.User.json_get_inviter);
router.get('/api/v2.0/user/getInviteeOrderbyName', middleware.isLoggedIn_middleware, controllers.User.json_get_inviteeOrderbynamePinyin);
router.get('/api/v2.0/user/getInvitee', middleware.isLoggedIn_middleware, controllers.User.json_get_invitee);
router.post('/api/v2.0/user/getInvitee', middleware.isLoggedIn_middleware, controllers.User.json_get_invitee);
router.get('/api/v2.0/user/getInviteeOrders', middleware.isLoggedIn_middleware, controllers.User.json_get_invitee_orders);
router.post('/api/v2.0/user/getInviteeOrders', middleware.isLoggedIn_middleware, controllers.User.json_get_invitee_orders);
router.get('/api/v2.0/usertypes', controllers.User.json_usertypes_get);
router.get('/api/v2.0/user/getUserAddressList', middleware.isLoggedIn_middleware, controllers.User.json_useraddresslist_query);
router.post('/api/v2.0/user/getUserAddressList', middleware.isLoggedIn_middleware, controllers.User.json_useraddresslist_query);
router.get('/api/v2.0/user/saveUserAddress', middleware.isLoggedIn_middleware, controllers.User.json_useraddress_create);
router.post('/api/v2.0/user/saveUserAddress', middleware.isLoggedIn_middleware, controllers.User.json_useraddress_create);
router.get('/api/v2.0/user/updateUserAddress', middleware.isLoggedIn_middleware, controllers.User.json_useraddress_update);
router.post('/api/v2.0/user/updateUserAddress', middleware.isLoggedIn_middleware, controllers.User.json_useraddress_update);
router.get('/api/v2.0/user/deleteUserAddress', middleware.isLoggedIn_middleware, controllers.User.json_useraddress_remove);
router.post('/api/v2.0/user/deleteUserAddress', middleware.isLoggedIn_middleware, controllers.User.json_useraddress_remove);
router.get('/api/v2.0/user/sign', middleware.isLoggedIn_middleware, controllers.User.process_user_sign);
router.post('/api/v2.0/user/sign', middleware.isLoggedIn_middleware, controllers.User.process_user_sign);
router.post('/api/v2.0/user/uploadPortrait', middleware.isLoggedIn_middleware, controllers.User.uploadPhoto);
router.post('/api/v2.0/user/upload', middleware.isLoggedIn_middleware, controllers.User.userUpload);
router.get('/api/v2.0/user/confirmUpload', middleware.isLoggedIn_middleware, controllers.User.confirmUpload);
router.post('/api/v2.0/user/confirmUpload', middleware.isLoggedIn_middleware, controllers.User.confirmUpload);
router.get('/api/v2.0/user/isAlive', middleware.isLoggedIn_middleware, controllers.User.isAlive);
router.get('/api/v2.0/user/isInWhiteList', middleware.isLoggedIn_middleware, middleware.isInWhiteList_middleware, controllers.User.isInWhiteList);
router.post('/api/v2.0/user/isInWhiteList', middleware.isLoggedIn_middleware, middleware.isInWhiteList_middleware, controllers.User.isInWhiteList);
router.get('/api/v2.1/user/getNominatedInviter', middleware.isLoggedIn_middleware, controllers.User.json_nominated_inviter_get);
router.get('/api/v2.2/user/queryConsignees', middleware.isLoggedIn_middleware, controllers.User.json_userconsignees_query);
router.get('/api/v2.2/user/saveConsignees', middleware.isLoggedIn_middleware, controllers.User.process_userconsignees_save);
router.post('/api/v2.2/user/saveConsignees', middleware.isLoggedIn_middleware, controllers.User.process_userconsignees_save);

// potential customer/intention products related APIs
router.get('/api/v2.1/intentionProducts', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_intention_products);
router.get('/api/v2.1/potentialCustomer/isAvailable', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_available);
router.post('/api/v2.1/potentialCustomer/add', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.process_add_potential_customer);
router.get('/api/v2.1/potentialCustomer/query', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer);
router.get('/api/v2.1/potentialCustomer/queryAllOrderbyName', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_orderby_namePinyin);
router.get('/api/v2.1/potentialCustomer/isLatest', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_islatest);
router.get('/api/v2.1/potentialCustomer/get', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_get);

// pay related APIs
router.get('/alipay', middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.alipayOrder);
router.post('/alipay', middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.alipayOrder);
router.get('/unionpay', middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.unionPayOrder);
router.post('/unionpay', middleware.isInWhiteList_middleware, middleware.throttle, controllers.Pay.unionPayOrder);
router.get('/offlinepay', controllers.Pay.offlinePay);
router.get('/EPOSpay', controllers.Pay.EPOSPay);
router.post('/dynamic/alipay/nofity.asp', controllers.Pay.alipayNotify);
router.post('/dynamic/alipay/notify.asp', controllers.Pay.alipayNotify);
router.post('/unionpay/nofity', controllers.Pay.unionpayNotify);
router.post('/unionpay/notify', controllers.Pay.unionpayNotify);
router.post('/EPOS/notify', controllers.Pay.process_EPOSNotify);
router.get('/api/v2.2/getOfflinePayType', controllers.Pay.json_offline_pay_type);
router.get('/api/v2.2/RSC/confirmOfflinePay', middleware.isLoggedIn_middleware, middleware.isRSC_middleware, controllers.Pay.process_RSC_confirm_OfflinePay);
router.post('/dynamic/alipay/refund_fastpay_by_platform_nopwd_notify.asp', controllers.Pay.alipayRefundNotify);
router.post('/unionpay/refundnotify', controllers.Pay.unionpayRefundNotify);

// RSC realted APIs
router.get('/api/v2.2/RSC/info/get', middleware.isLoggedIn_middleware, controllers.RSC.json_RSC_info_get);
router.post('/api/v2.2/RSC/info/fill', middleware.isLoggedIn_middleware, controllers.RSC.process_RSC_info_fill);
router.get('/api/v2.2/RSC/address/province', middleware.isLoggedIn_middleware, controllers.RSC.json_RSC_address_province_query);
router.get('/api/v2.2/RSC/address/city', middleware.isLoggedIn_middleware, controllers.RSC.json_RSC_address_city_query);
router.get('/api/v2.2/RSC/address/county', middleware.isLoggedIn_middleware, controllers.RSC.json_RSC_address_county_query);
router.get('/api/v2.2/RSC/address/town', middleware.isLoggedIn_middleware, controllers.RSC.json_RSC_address_town_query);
router.get('/api/v2.2/RSC', middleware.isLoggedIn_middleware, controllers.RSC.json_RSC_query);
router.get('/api/v2.2/RSC/orderDetail', middleware.isLoggedIn_middleware, middleware.isRSC_middleware, controllers.RSC.json_RSC_order_detail);
router.get('/api/v2.2/RSC/orders', middleware.isLoggedIn_middleware, middleware.isRSC_middleware, controllers.RSC.json_RSC_orders_get);
router.post('/api/v2.2/RSC/order/deliverStatus/delivering', middleware.isLoggedIn_middleware, middleware.isRSC_middleware, controllers.RSC.process_RSC_order_deliverStatus_delivering);
router.post('/api/v2.2/RSC/order/selfDelivery', middleware.isLoggedIn_middleware, middleware.isRSC_middleware, middleware.throttle, controllers.RSC.process_self_delivery);

// compatibility APIs
controllers.Compatibility.compatibilityAPIs(router);

// backend admin APIs
router.get(F.config['manager-url']+'/api/login/', controllers.Manager.process_login);
router.post(F.config['manager-url']+'/api/login/', controllers.Manager.process_login);

//7.manager
router.get(F.config['manager-url']+'/api/dashboard/online/',middleware.backend_auth ,controllers.Manager.json_dashboard_online);
router.get(F.config['manager-url']+'/api/orders/',middleware.backend_auth ,controllers.Manager.json_orders_query);
router.get(F.config['manager-url']+ '/api/orders/:id/',middleware.backend_auth ,controllers.Manager.json_orders_read);
router.get(F.config['manager-url']+ '/api/v2.2/RSC/queryByProducts',middleware.backend_auth ,controllers.Manager.json_RSC_query_by_products);
router.get(F.config['manager-url']+ '/api/backend/users',middleware.backend_auth ,controllers.Manager.json_be_users);
router.put(F.config['manager-url']+ '/api/orders/RSCInfo/',middleware.backend_auth,middleware.auditing_middleware ,controllers.Manager.process_orders_RSCInfo_update);
router.put(F.config['manager-url']+ '/api/orders/subOrders/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_subOrders_payments_update);
router.put(F.config['manager-url']+  '/api/orders/SKUs/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_orders_SKUs_update);

router.get(F.config['manager-url']+ '/api/brands/',	middleware.backend_auth,controllers.Manager.json_brands);

router.get(F.config['manager-url']+  '/api/products/',middleware.backend_auth,controllers.Manager.json_products_query);
router.post(F.config['manager-url']+  '/api/products/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_products_save);
router.post(F.config['manager-url']+  '/api/products/updateStatus',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.process_products_updateStatus);
router.delete(F.config['manager-url']+ '/api/products/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_products_remove);
router.get(F.config['manager-url']+ '/api/products/categories/',middleware.backend_auth,controllers.Manager.json_products_categories);
router.get(F.config['manager-url']+ '/api/products/attributes/',middleware.backend_auth,controllers.Manager.json_products_attributes);
router.get(F.config['manager-url']+ '/api/products/:id/',middleware.backend_auth,controllers.Manager.json_products_read);

// USERS
router.get(F.config['manager-url']+ '/api/users/',middleware.backend_auth,controllers.Manager.json_users_query);

//// admin / manager
router.get('/manager', middleware.backend_auth ,controllers.Manager.manager);
router.get('/manager/*', middleware.backend_auth ,controllers.Manager.manager);

module.exports = router;