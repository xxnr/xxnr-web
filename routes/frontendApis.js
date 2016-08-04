/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');
var throttle = require('../middlewares/throttle');

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
router.post('/api/v2.1/ISOupgrade', controllers.Api_v1_0.IOSUpgrade);
router.post('/api/v2.1/AppUpgrade', controllers.Api_v1_0.AppUpgrade);

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
// Old
router.get('/api/v2.0/sms', throttle.forbidden_sms_attack_request, middleware.throttle, controllers.VCode.generate_sms);
router.post('/api/v2.0/sms', throttle.forbidden_sms_attack_request, middleware.throttle, controllers.VCode.generate_sms);
// new
// graph vcode
// refresh graph vcode
router.get('/:type/captcha/:filename', throttle.forbidden_sms_attack_request, middleware.throttle, controllers.VCode.graph_vcode_image);
router.get('/api/v2.3/captcha', throttle.forbidden_sms_attack_request, middleware.throttle, controllers.VCode.generate_refresh_graph_vcode);
// new sms
router.post('/api/v2.3/sms', throttle.forbidden_sms_attack_request, middleware.throttle, controllers.VCode.generate_validate_sms);

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
router.get('/api/v2.0/user/getUserAddressList', middleware.isLoggedIn_middleware, controllers.User.json_useraddresslist_get);
router.post('/api/v2.0/user/getUserAddressList', middleware.isLoggedIn_middleware, controllers.User.json_useraddresslist_get);
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
router.get('/api/v2.2/getOfflinePayType', controllers.Pay.json_offline_pay_type);

// potential customer/intention products related APIs
router.get('/api/v2.1/intentionProducts', controllers.User.json_intention_products);
router.get('/api/v2.1/potentialCustomer/isAvailable', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_available);
router.post('/api/v2.1/potentialCustomer/add', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.process_add_potential_customer);
router.get('/api/v2.1/potentialCustomer/query', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer);
router.get('/api/v2.1/potentialCustomer/queryAllOrderbyName', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_orderby_namePinyin);
router.get('/api/v2.1/potentialCustomer/isLatest', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_islatest);
router.get('/api/v2.1/potentialCustomer/get', middleware.isLoggedIn_middleware, middleware.isXXNRAgent_middleware, controllers.User.json_potential_customer_get);
router.get('/api/v2.3/intentionProducts', controllers.User.json_intention_products_with_brand);

// RSC related APIs
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

// rewardshop
router.get('/api/v2.3/rewardshop/get', middleware.isLoggedIn_middleware, controllers.Rewardshop.json_rewardshop_get);
router.get('/api/v2.3/rewardshop/pointslogs', middleware.isLoggedIn_middleware, controllers.Rewardshop.json_rewardshop_pointslogs);
router.get('/api/v2.3/rewardshop/gifts/categories', controllers.Rewardshop.json_rewardshop_categories);
router.get('/api/v2.3/rewardshop/gifts/getGiftDetail', controllers.Rewardshop.json_rewardshop_giftDetail);
router.get('/api/v2.3/rewardshop/gifts', controllers.Rewardshop.json_rewardshop_gifts);
router.post('/api/v2.3/rewardshop/addGiftOrder', middleware.isLoggedIn_middleware, controllers.Rewardshop.add_gift_order);
router.get('/api/v2.3/rewardshop/getGiftOrderList', middleware.isLoggedIn_middleware, controllers.Rewardshop.json_gift_order_query);
router.get('/api/v2.3/rewardshop/getGiftOrder', middleware.isLoggedIn_middleware, controllers.Rewardshop.json_gift_order_detail);
router.get('/rewardshop/rules', controllers.Rewardshop.view_rewardshop_rules);
// RSC rewardshop order
router.get('/api/v2.3/RSC/rewardshop/getGiftOrderList', middleware.isLoggedIn_middleware, middleware.isRSC_middleware, controllers.Rewardshop.json_RSC_gift_order_query);
router.post('/api/v2.3/RSC/rewardshop/order/selfDelivery', middleware.isLoggedIn_middleware, middleware.isRSC_middleware, middleware.throttle, controllers.Rewardshop.process_RSC_gift_order_self_delivery);


// compatibility APIs
controllers.Compatibility.compatibilityAPIs(router);

module.exports = router;