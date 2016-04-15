/**
 * Created by pepelu on 2016/4/11.
 */
var express = require('express');
var router = express.Router();
var controllers = require('./controllers');
var path = require('path');
var middleware = require('./middlewares/authentication');

// front end page
router.get('/', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/index.html'));});
router.get('/header', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/header'));});
router.get('/footer', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/footer'));});

// area address
router.get('/api/v2.0/area/getAreaList', controllers.Area.json_province_query);
router.post('/api/v2.0/area/getAreaList', controllers.Area.json_province_query);
router.get('/api/v2.0/area/getAreaCity', controllers.Area.json_city_query);
router.post('/api/v2.0/area/getAreaCity', controllers.Area.json_city_query);
router.get('/api/v2.0/area/getAreaCounty', controllers.Area.json_county_query);
router.post('/api/v2.0/area/getAreaCounty', controllers.Area.json_county_query);
router.get('/api/v2.0/area/getAreaTown', controllers.Area.json_town_query);
router.post('/api/v2.0/area/getAreaTown', controllers.Area.json_town_query);

// v1.0 api
router.get('/api/v2.0/businessDistrict/getBusinessByAreaId', controllers.Area.json_city_query);
router.post('/api/v2.0/businessDistrict/getBusinessByAreaId', controllers.Area.json_city_query);
router.get('/api/v2.0/build/getBuildByBusiness', controllers.Area.json_county_query);
router.post('/api/v2.0/build/getBuildByBusiness', controllers.Area.json_county_query);

// old apis
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
router.get('/app/ad/getAdList', controllers.Api_v1_0.api10_getBanners);
router.post('/app/ad/getAdList', controllers.Api_v1_0.api10_getBanners);
router.get('/api/v2.0/product/getAppProductDetails', controllers.Api_v1_0.getAppProductDetails);
router.post('/api/v2.0/product/getAppProductDetails', controllers.Api_v1_0.getAppProductDetails);
router.get('/api/v2.0/getMinPayPrice', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getMinPayPrice);
router.post('/api/v2.0/getMinPayPrice', middleware.isLoggedIn_middleware, controllers.Api_v1_0.getMinPayPrice);

// order
router.get('/api/v2.0/order/getOderList', middleware.isLoggedIn_middleware, controllers.Order.getOrders);
router.post('/api/v2.0/order/getOderList', middleware.isLoggedIn_middleware, controllers.Order.getOrders);

// user
router.get('/api/v2.0/user/login', controllers.User.process_login);
router.post('/api/v2.0/user/login', controllers.User.process_login);
router.get('/api/v2.0/user/getpubkey', controllers.User.json_public_key);
router.post('/api/v2.0/user/getpubkey', controllers.User.json_public_key);
module.exports = router;