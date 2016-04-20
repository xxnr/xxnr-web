/**
 * Created by pepelu on 2016/4/11.
 */
var express = require('express');
var router = express.Router();
var controllers = require('./controllers');
var path = require('path');
var middleware = require('./middlewares/authentication');

global.F = {
    config:require('./config'),
    global:require('./global')
};

// front end page
router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './public/xxnr/index.html'));
});
router.get('/header', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/header.html'));});
router.get('/footer', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/footer.html'));});

// admin / manager
router.get('/manager', middleware.backend_auth ,function(req, res, next){
    res.render(path.join(__dirname, './views/manager'),
        {
            manager_url:F.config['manager-url'],
            user_types:F.config['user_types'],
            user:req.user
        }
    );
});

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
router.get('/app/ad/getAdList', controllers.Api_v1_0.api10_getBanners);
router.post('/app/ad/getAdList', controllers.Api_v1_0.api10_getBanners);
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

// backend admin APIs
router.get(F.config['manager-url']+'/api/login/', controllers.Manager.process_login);
router.post(F.config['manager-url']+'/api/login/', controllers.Manager.process_login);

module.exports = router;