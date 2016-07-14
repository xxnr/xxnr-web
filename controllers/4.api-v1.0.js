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
var PayService = services.pay;
var path = require('path');
var AppupgradeService = services.Appupgrade;


exports.install = function () {
    //fix api// F.route('/api/v2.0/getProductDetails/', getProductDetails, ['post', 'get']);
    //F.route('/api/v2.0/products/', getProducts, ['post', 'get']);
    //F.route('/api/v2.0/products/categories/', getCategories, ['post', 'get']);
    //F.route('/api/v2.0/getShoppingCart', getShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //F.route('/api/v2.0/updateShoppingCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //fix api// F.route('/api/v2.0/addToCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //F.route('/api/v2.0/shopCart/getShopCartList', getShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //F.route('/api/v2.0/shopCart/changeNum', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //F.route('/api/v2.0/shopCart/addToCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
//    F.route('/api/v2.0/product/getGoodsListPage', getGoodsListPage, ['post', 'get']);
//    F.route('/api/v2.0/product/getProductsListPage', getGoodsListPage, ['post', 'get']);
//    F.route('/api/v2.0/product/getGoodsDetails', getGoodsDetails, ['post', 'get']);
    // get product detail for web
    //F.route('/api/v2.0/product/getProductDetails', getGoodsDetails, ['post', 'get']);
    //F.route('/api/v2.0/getShoppingCartOffline', getShoppingCartOffline, ['get', 'post']);
    // // pay
    // F.route('/alipay', alipayOrder, ['post', 'get'], ['isInWhiteList']);
    // F.route('/dynamic/alipay/notify.asp', alipayNotify, ['post','raw']);
    // F.route('/dynamic/alipay/nofity.asp', alipayNotify, ['post','raw']);
    // F.route('/unionpay', unionPayOrder, ['post', 'get'], ['isInWhiteList']);
    // F.route('/unionpay/notify', unionpayNotify, ['post','raw']);
    // F.route('/unionpay/nofity', unionpayNotify, ['post','raw']);
    // F.route('/alipay/success', aliPaySuccess);
    // // pay refund
    // F.route('/dynamic/alipay/refund_fastpay_by_platform_nopwd_notify.asp', alipayRefundNotify, ['post','raw']);
    // F.route('/unionpay/refundnotify', unionRefundNotify, ['post','raw']);

    // F.route('/notify_alipay.asp', alipayNotify);
    //fix api// F.route('/unionPay', unionPayOrder, ['post', 'get']);
    //fix api// F.route('/unionpay', unionPayOrder, ['post', 'get']);
    // Brands Models Engines etc. attributes
    //F.route('/api/v2.0/products/{attributeName}/', getAttributes, ['get']);
    // home page banners
    //F.route('/api/v2.0/ad/getAdList', api10_getBanners, ['post', 'get', 'upload'], 8);
    // get product detail for app
    //F.route('/api/v2.0/product/getAppProductDetails/', getAppProductDetails, ['post', 'get']);
    // product app info page (app_body app_standard app_support)
    //F.route('/product/{productInfo}/{productId}/', view_product_info);
    // get min pay price
    // F.route('/api/v2.0/getMinPayPrice/',       getMinPayPrice, ['get'], ['isLoggedIn']);
    //F.route('/api/v2.0/getMinPayPrice/',       getMinPayPrice, ['post', 'get'], ['isLoggedIn']);

    // IOS upgrade message
    // F.route('/api/v2.1/ISOupgrade/',       IOSUpgrade, ['post']);
    // F.route('/api/v2.1/IOSupgrade/',       IOSUpgrade, ['post']);

    // v1.0
    //fix api// F.route('/app/shopCart/getShopCartList', getShoppingCart, ['post', 'get']);
    //fix api// F.route('/app/shopCart/changeNum', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
    //fix api// F.route('/app/shopCart/addToCart', updateShoppingCart, ['post', 'get'], ['isLoggedIn']);
//	F.route('/app/goods/getGoodsListPage', api10_getProducts, ['post', 'get', 'upload'], 8);
    //fix api// F.route('/app/goods/getGoodsDetails', getGoodsDetails, ['post', 'get']);
    //F.route('/app/goods/getWebGoodsDetails', api10_getProductDetail, ['post', 'get', 'upload'], 8);
    //F.route('/app/ad/getAdList', api10_getBanners, ['post', 'get', 'upload'], 8);

    // F.route('/api/v2.2/getOfflinePayType',              json_offline_pay_type, ['get']);
    // F.route('/offlinepay', offlinePay, ['get', 'isLoggedIn']);
    // // TODO: not tested and documented apis, add more conditions, need more tests
    // F.route('/api/v2.2/RSC/confirmOfflinePay',          process_RSC_confirm_OfflinePay, ['get'],    ['isLoggedIn', 'isRSC']);
};

var converter = require('../common/converter');
var alipay = require('../configuration/alipay_config').alipay;
var AlipayNotify = require('../configuration/alipay_config').alipayNotify;
var unionPayConfig = require('../configuration/unionPay_config');
var api10 = converter.api10;
var calculatePrice = require('../common/calculator').calculatePrice;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var OFFLINEPAYTYPE = require('../common/defs').OFFLINEPAYTYPE;
var dri = require('../common/dri');
var moment = require('moment-timezone');
var appVersionConfig = require('../configuration/appVersion_config');
// console.log('PAYMENTSTATUS=' + JSON.stringify(PAYMENTSTATUS));

exports.getProducts = function (req, res, next) {
    var category = req.data.category;
    var userId = req.data.userId;
    var max = req.data.max;

    var options = {online: {$exists: false}};

    if (category)
        options.category = category;

    var page = req.data.page;

    if (page)
        options.page = page;

    if (max)
        options.max = max;

    var pagemax = 50;
    max = U.parseInt(options.max, 20);
    options.max = max > pagemax ? pagemax : max;

    ProductService.query(options, function (err, data) {
        if (err) {
            res.respond({code: 1001, message: '查询失败'});
            return;
        }

        res.respond({
            'code': "1000", "message": "success",
            "products": api10.convertProducts(data.items),
            "userId": userId,
            "category": category
        });
    });
};

exports.getGoodsListPage = function (req, res, next) {
    var page = req.data["page"];
    var max = req.data["rowCount"] || req.data["max"];
    var category = req.data["classId"];
    var brandName = req.data["brandName"];
    var reservePrice = req.data["reservePrice"];
    var modelName = req.data["modelName"];
    var sort = req.data["sort"];

    var options = {online: {$exists: false}};

    if (category)
        options.category = category;

    if (page)
        options.page = page;

    if (max)
        options.max = max;

    var pagemax = 50;
    max = U.parseInt(options.max, 20);
    options.max = max > pagemax ? pagemax : max;

    if (brandName)
        options.brandName = decodeURI(brandName).split(',');

    if (reservePrice)
        options.reservePrice = decodeURI(reservePrice).split(',');

    if (modelName)
        options.modelName = decodeURI(modelName).split(',');

    if (sort)
        options.sort = decodeURI(sort);

    ProductService.query(options, function (err, data) {
        if (err) {
            console.log('error occurred while querying products, and the error is ' + err);
            return;
        }

        var products = [];
        var count = data.count;
        var pages = data.pages;
        var page = data.page;

        for (var i = 0; i < data.items.length; i++) {
            var product = api10.convertProduct(data.items[i]);
            var good = {
                "goodsId": product.id, "awardPoint": "", "unitPrice": (product.discountPrice),
                "goodsGreatCount": (product.positiveRating || 1.0) * 100, "brandId": product.brandId,
                "brandName": product.brandName, "imgUrl": product.imgUrl,
                "allowScore": product.payWithScoresLimit,
                "thumbnail": product.thumbnail,
                "stock": "100" /*TODO*/, "originalPrice": product.price, "goodsSellCount": 2/*TODO*/,
                /*"goodsSort":3,*/ "goodsName": product.name,
                "model": product.model,
                "presale": product.presale ? product.presale : false,
                pictures: product.pictures
            };

            products.push(good);
        }

        var goodsListPage = {
            "code": "1000",
            "message": "success",
            "datas": {total: count, "rows": products, "pages": pages, "page": page}
        };

        res.respond(goodsListPage);
    });
};

exports.getGoodsDetails = function (req, res, next) {
    var options = {};
    options.id = req.data['goodsId'];

    ProductService.get(options, function (err, data) {
        if (err) {
            res.respond({code: 1001, message: '查询失败'});
            return;
        }

        var product = api10.convertProduct(data);
        var goodDetails = {
            "code": "1000", "message": "success",
            "datas": {
                "total": 1, "rows": []
            }, "locationUserId": req.data["locationUserId"]
        };

        var goodDetail = {
            "goodsId": product.id, "goodsHabitatName": null,
            "recommendedStar": product.stars,
            "awardPoint": "",
            "unitPrice": (product.discountPrice),
            "goodsGreatCount": (product.positiveRating || 1.0) * 100,
            "imgUrl": product.imgUrl,
            "originalUrl": product.originalUrl,
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
            "attributes": product.attributes,
            "SKUAttributes": product.SKUAttributes,
            "SKUAdditions": product.SKUAdditions,
            "SKUPrice": product.SKUPrice,
            "pictures": product.pictures,
            "referencePrice": product.referencePrice
        };

        delete product.body;

        for (var i in product) {
            if ((!goodDetail.hasOwnProperty(i)) && product.hasOwnProperty(i)) {
                goodDetail[i] = product[i];
            }
        }

        goodDetails.datas.rows.push(goodDetail);
        var response = goodDetail;

        res.respond(response);
    });
};

exports.getAppProductDetails = function (req, res, next) {
    if (!req.data['productId']) {
        res.respond({"code": "1001", "message": "缺少商品ID"});
        return;
    }
    var host = req.hostname;
    var prevurl = req.protocal + '://' + host + '/product/';
    var options = {};
    options.id = req.data['productId'];

    ProductService.get(options, function (err, data) {
        if (err || !data) {
            res.respond({"code": "1001", "message": "无法查找到商品"});
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

        if (data.app_support && data.app_support !== '')
            data.app_support_url = prevurl + 'app_support/' + data.id;
        else
            data.app_support_url = '';
        delete data.app_support;
        var product = api10.convertProduct(data);

        res.respond({"code": "1000", "message": "success", "datas": product});
    });
};

// get product info page
exports.view_product_info = function (req, res, next) {
    var options = {};
    options.id = req.params.productId;
    var productInfo = req.params.productInfo;
    ProductService.get(options, function (err, data) {
        if (err || !data) {
            res.status(404).send('404: Page not found');
            return;
        }
        var result = {};
        if (productInfo && data[productInfo] && data[productInfo] !== '') {
            if (productInfo === "app_body") {
                result.title = '商品详情' + (data.name ? (' - ' + data.name) : '');
            } else if (productInfo === "app_standard") {
                result.title = '参数规格' + (data.name ? (' - ' + data.name) : '');
            } else if (productInfo === "app_support") {
                result.title = '服务说明' + (data.name ? (' - ' + data.name) : '');
            }
            result.productInfo = data[productInfo];
        } else {
            res.status(404).send('404: Page not found');
            return;
        }

        res.render(path.join(__dirname, '../views/4.api-v1.0/productInfoAppTemplate'),
            {
                result: result
            }
        );
    });
};

exports.getCategories = function (req, res, next) {
    CategoryService.all(function (err, categories) {
        if (err) {
            res.respond({code: 1001, message: 'fail to query category'});
            return;
        }

        res.respond({code: 1000, message: 'success', categories: categories});
    });
};

exports.getShoppingCart = function (req, res, next) {
    var userId = req.data.userId;
    if (!userId) {
        res.respond({code: 1001, message: 'param userId required'});
        return;
    }

    CartService.getOrAdd(userId, function (err, cart) {
        if (err) {
            res.respond({code: 1001, message: '查询购物车失败'});
            return;
        }

        var products = [];
        if (cart.items && cart.items.length > 0) {
            cart.items.forEach(function (item) {
                if (item.product) {
                    var product = item.product;
                    product.count = item.count;
                    products.push(product);
                }
            });
        }

        res.respond(convertToShoppingCartFormatV_1_0(products, cart.cartId, cart.userId));
    })
};

exports.updateShoppingCart = function (req, res, next) {
    var userId = req.data['userId'];
    var goodsId = req.data['goodsId'];
    var count = req.data['quantity'];
    var update_by_add = req.data['update_by_add'];
    if (!userId) {
        var response = {code: 1001, message: 'param userId required'};
        res.respond(response);
        return;
    }
    if (!goodsId) {
        var response = ( {code: 1001, message: 'param goodsId required'});
        res.respond(response);
        return;
    }
    if (!count) {
        count = req.data['count'];//This is to support addToCart api
        if (!count) {
            var response = {code: 1001, message: 'param quantity/count required'};
            res.respond(response);
            return;
        }
    }

    if (parseInt(count) > 9999) {
        res.respond({code: 1001, message: '商品个数不能大于9999'});
        return;
    }

    var options = {};
    options.userId = userId;
    options.goodsId = goodsId;

    CartService.getOrAdd(userId, function (err, cart) {
        if (err) {
            res.respond({code: 1001, message: '获取购物车失败'});
            return;
        }

        ProductService.get({id: goodsId}, function (err, data) {
            if (err || !data) {
                res.respond({"code": "1001", "message": "无法查找到商品"});
                return;
            }

            if (data && data.presale) {
                res.respond({"code": "1001", "message": "无法添加预售商品"});
                return;
            }

            CartService.updateItems(cart.cartId, data._id, count, update_by_add, function (err) {
                if (err) {
                    res.respond({code: 1001, message: '更新购物车失败'});
                    return;
                }

                res.respond({code: 1000, message: 'success'});
            })
        }, false);
    });
};

function getBanners(req, callback) {
    var fs = require('fs');
    var bannerType = req.data['bannerType'] || 'app';
    // var bannerFolder = `${XXNR_DIR}/images/banners/` + bannerType;
    var imageFolder = 'images/banners/' + bannerType;
    var bannerFolder = (F.config.directory_xxnr_public ? F.config.directory_xxnr_public : '/public/' + XXNR_DIR + '/') + imageFolder;


    var root = require('path').resolve(__filename + `/../..` +bannerFolder);
    // console.log('root = ' + root);

    var data = [], files = fs.readdir(root, function (err, files) {
        files.forEach(function (file) {
            if (file.indexOf('.jpg') >= 0 || file.indexOf('png') >= 0) {
                data.push({"imgUrl":`/${imageFolder}/${file}`,"id":file, "url":""});
        }
    });

    callback(data, null);
});
}


exports.api10_getBanners = function (req, res, next) {
    getBanners(req, function (data, err) {
        data = {
            "code": "1000",
            "message": "success",
            "datas": {"total": data.length, "rows": data, "locationUserId": ""}
        };
        res.respond(data);
    });
};

exports.getShoppingCartOffline = function (req, res, next) {
    var products = JSON.parse(decodeURI(req.data.products));
    if (!products || !Array.isArray(products) || !(products.length > 0)) {
        res.respond({code: 1001, message: '请提供正确的参数'});
        return;
    }

    ProductService.idJoinWithCount({products: products}, function (err, products) {
        if (err) {
            res.respond({code: 1001, message: err});
        } else {
            res.respond(convertToShoppingCartFormatV_1_0(products, null, null));
        }
    });
};

// return the format that FE need for shopping cart for v1.0
// productDetails: the products Product.idJoinWithCount returns
// cartId: the cart id need to return
// userId: the user id need to return
function convertToShoppingCartFormatV_1_0(productDetails, cartId, userId) {
    var goodDetails = {
        "code": "1000", "message": "success",
        "datas": {
            "total": 0, "shopCartId": cartId, "DiscountPrice": 0, "locationUserId": userId, "totalPrice": 0, "rows": []
        }
    };
    var brands = [];
    var brandNames = [];
    var totalCount = 0;

    for (var i = 0; i < productDetails.length; i++) {
        var product = api10.convertProduct(productDetails[i]);
        var goodDetail = {
            "goodsId": product.id,
            "unitPrice": product.discountPrice,
            "imgUrl": product.thumbnail,
            "productDesc": product.description,
            "point": product.payWithScoresLimit,
            "originalPrice": product.price,
            "goodsName": product.name,
            "deposit": product.deposit,
            "goodsCount": product.count
        };
        var brandName = product.brandName;
        if (!brands[brandName]) {
            brands[brandName] = [];
            brandNames.push(brandName);
        }
        totalCount += parseInt(product.count);
        brands[brandName].push(goodDetail);
    }
    goodDetails.datas.total = productDetails.length;
    goodDetails.datas.totalCount = totalCount;
    for (var brandNameIndex = 0; brandNameIndex < brandNames.length; brandNameIndex++) {
        var brand = {"brandName": brandNames[brandNameIndex], "goodsList": brands[brandNames[brandNameIndex]]};
        goodDetails.datas.rows.push(brand);
    }

    return goodDetails;
}

// Get Brands Models Engines etc. attributes
exports.getAttributes = function (req, res, next) {
    var attributeName = req.params.attributeName;
    var category = req.data.category;

    // support old app
    if (category == '化肥') {
        category = '531680A5';
    }
    if (category == '汽车') {
        category = '6C7D8F66';
    }

    var brand = req.data.brand;
    if (attributeName == 'brands') {
        // brands is treated as an attribute before
        // we need to check here
        BrandService.query(category, function (err, brands) {
            if (err) {
                console.error('query brands error', err);
                res.respond({code: 1001, message: '获取品牌列表失败', error: err});
                return;
            }

            res.respond({'code': '1000', 'message': 'success', 'datas': brands});
        })
    } else {
        if (attributeName == 'models') attributeName = '车系';
        if (attributeName == 'engines') attributeName = '排量';
        if (attributeName == 'gearboxes') attributeName = '变速箱';
        if (attributeName == 'levels') attributeName = '车型';
        ProductService.getAttributes(category, brand, attributeName, function (err, attributes) {
            if (err) {
                console.error('query attributes error', err);
                res.respond({code: 1001, message: '获取商品属性列表失败', error: err});
                return;
            }

            res.respond({
                'code': '1000',
                'message': 'success',
                'datas': attributes.length > 0 ? attributes[0].values || [] : []
            });
        })
    }
};

// Get min pay price
exports.getMinPayPrice = function (req, res, next) {
    var minPayPrice = F.config.minPayPrice;
    if (minPayPrice) {
        res.respond({'code': '1000', 'message': 'success', 'payprice': minPayPrice});
    } else {
        res.respond({'code': '1002', 'message': '未查询到数据'});
    }
};

exports.IOSUpgrade = function (req, res, next) {
    var postVersion = req.data['version'] || '';
    var nowVersion = F.config.nowIosVersion || '';
    if (!postVersion || AppupgradeService.compareVersion(nowVersion, postVersion)) {
        res.respond({code: 1000, message: '版本升级啦，快点去更新吧', version: nowVersion});
        return;
    } else {
        res.respond({code: 1200, message: '最新版本', version: nowVersion});
        return;
    }
};
/**
 * app 检测升级
 * @param req
 * @param res
 * @param next
 * @constructor
 */
exports.AppUpgrade = function (req, res, next) {
    var postVersion = req.data['version'] || '';
    var device_token = req.data['device_token'] || '';
    var userAgent = (req.data['user_agent'] || '').toLowerCase();
    var device_id = req.data['device_id'] || '';

    var host = req.hostname;
    var android_update_url = 'http://' + host + '/resources/newFarmer.apk';

    // var nowIosVersion = F.config.nowIosVersion;
    // var nowAndroidVersion = F.config.nowAndroidVersion;

    var nowIosVersion = appVersionConfig.nowIosVersion;
    var nowAndroidVersion = appVersionConfig.nowAndroidVersion;

    var options = {};
    var upgradeMessage = '新新农人已升级版本，快去更新应用吧~';

    options.device_token = device_token;
    options.version = postVersion;
    options.device_id = device_id;

    //返回给前台
    if (userAgent.indexOf('android') !=-1) {
        options.user_agent = 'android';
        if (!postVersion || AppupgradeService.compareVersion(nowAndroidVersion, postVersion)) {
            if (appVersionConfig.version_map && appVersionConfig.version_map['android'] && appVersionConfig.version_map['android'] && appVersionConfig.version_map['android'][nowAndroidVersion]) {
                upgradeMessage = appVersionConfig.version_map['android'][nowAndroidVersion];
            }
            res.respond({
                code: 1000,
                message: upgradeMessage,
                version: nowAndroidVersion,
                android_update_url: android_update_url
            });
        } else {
            res.respond({code: 1200, message: '最新版本', version: nowAndroidVersion});
        }
    } else if (userAgent.indexOf('ios') != -1) {
        options.user_agent = 'ios';
        if (!postVersion || AppupgradeService.compareVersion(nowIosVersion, postVersion)) {
            if (appVersionConfig.version_map && appVersionConfig.version_map['ios'] && appVersionConfig.version_map['ios'] && appVersionConfig.version_map['ios'][nowIosVersion]) {
                upgradeMessage = appVersionConfig.version_map['ios'][nowIosVersion];
            }
            res.respond({
                code: 1000,
                message: upgradeMessage,
                version: nowIosVersion
            });
        } else {
            res.respond({code: 1200, message: '最新版本', version: nowIosVersion});
        }
    } else {
        res.respond({code: 1001, message: '请提供正确的参数'});
        return;
    }
    if(device_token){
        //存储用户的更新信息
        AppupgradeService.saveAndUpdate(options, function (err) {
            if (err) {
                console.error('save device version', err);
            }
        });
    }

};
