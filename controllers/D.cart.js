/**
 * Created by pepelu on 2016/1/8.
 */
var services = require('../services');
var CartService = services.cart;
var SKUService = services.SKU;
var CategoryService = services.category;
var converter = require('../common/converter');
var api10 = converter.api10;

exports.install = function() {
    //F.route('/api/v2.1/cart/getShoppingCart', getShoppingCart, ['get'], ['isLoggedIn']);
    //F.route('/api/v2.1/cart/addToCart', updateShoppingCart, ['post'], ['isLoggedIn']);
    //F.route('/api/v2.1/cart/changeNum', updateShoppingCart, ['post'], ['isLoggedIn']);
    //F.route('/api/v2.1/cart/getShoppingCartOffline', getShoppingCartOffline, ['post']);

    // jiesuan
    //F.route('/api/v2.2/cart/getDeliveries', getSKUDeliveries, ['post'], ['isLoggedIn']);
};

exports.updateShoppingCart = function(req, res, next) {
    var userId = req.data['userId'];
    var SKUId = req.data['SKUId'];
    var count = req.data['quantity'];
    var update_by_add = req.data['update_by_add'];
    var additions = req.data.additions;
    if (!userId) {
        var response = {code: 1001, message: "param userId required"};
        res.respond(response);
        return;
    }

    if (!SKUId) {
        var response = {code: 1001, message: "param goodsId required"};
        res.respond(response);
        return;
    }

    if (typeof count == 'undefined') {
        count = req.data['count'];//This is to support addToCart api
        if (typeof count == 'undefined') {
            var response = {code: 1001, message: "param quantity/count required"};
            res.respond(response);
            return;
        }
    }

    if (parseInt(count) > 9999) {
        res.respond({code: 1001, message: "商品个数不能大于9999"});
        return;
    }

    if(typeof update_by_add == 'string'){
        update_by_add = (update_by_add === 'true');
    }

    var options = {};
    options.userId = userId;
    options.SKUId = SKUId;

    CartService.getOrAdd(userId, function (err, cart) {
        if (err) {
            res.respond({code: 1001, message: "获取购物车失败"});
            return;
        }

        SKUService.getSKU({_id: SKUId}, function (err, SKU) {
            if (err || !SKU) {
                res.respond({code: 1001, message: "无法查找到商品"});
                return;
            }

            if(count != 0) {
                if (SKU && SKU.product.presale) {
                    res.respond({code: 1001, message: "无法添加或修改预售商品"});
                    return;
                }

                if (SKU && !SKU.product.online) {
                    res.respond({code: 1001, message: "无法添加或修改下架商品"});
                    return
                }

                if (!SKU.online) {
                    res.respond({code: 1001, message: "无法添加或修改下架SKU"});
                    return
                }
            }

            CartService.updateSKUItems(cart.cartId, SKU._id, count, update_by_add, additions, function (err) {
                if (err) {
                    console.log(err);
                    res.respond({code: 1001, message: "更新购物车失败"});
                    return;
                }

                res.respond({code: 1000, message: "success"});
            })
        }, false);
    });
};

exports.getShoppingCart = function(req, res, next){
    var userId = req.data.userId;
    if(!userId){
        res.respond({code:1001, message:'param userId required'});
        return;
    }

    CartService.getOrAdd(userId, function(err, cart){
        if(err){
            res.respond({code:1001, message:'查询购物车失败'});
            return;
        }

        res.respond(convertToShoppingCartFormatV_1_0(cart.SKU_items || [], cart.cartId, cart.userId));
    }, true)
};

exports.getShoppingCartOffline = function(req, res, next){
    var SKUs = req.data.SKUs;
    if(!SKUs || !Array.isArray(SKUs) || !(SKUs.length > 0)){
        res.respond({code:1001, message:'请提供正确的参数'});
        return;
    }

    SKUService.idJoinWithCount({SKUs: SKUs}, function(err, SKUs){
        if(err){
            res.respond({code:1001,message:err});
        }else {
            res.respond(convertToShoppingCartFormatV_1_0(SKUs || [], null, null));
        }
    });
};

function convertToShoppingCartFormatV_1_0(SKUs, cartId, userId){
    var goodDetails = {"code":1000,"message":"success",
        "datas":{"total":0, "shopCartId":cartId, "DiscountPrice":0, "locationUserId":userId, "totalPrice":0, "rows":[
        ]}};
    var brands = [];
    var brandsOfflineEntryCount = [];
    var brandNames = [];
    var totalCount = 0;
    var offlineEntryCount = 0;

    for(var i=0; i<SKUs.length; i++) {
        var SKU = SKUs[i].SKU;
        var count = SKUs[i].count;
        var product = api10.convertProduct(SKUs[i].product);
        var additions = SKUs[i].additions;
        var SKUDetail = {"goodsId": product.id,
            "_id": SKU._id,
            "price": SKU.price.platform_price,
            "imgUrl": product.thumbnail,
            "productDesc": product.description,
            "point": product.payWithScoresLimit,
            "name": SKU.name,
            "productName": product.name,
            "attributes": SKU.attributes,
            "deposit": product.deposit,
            "count":count,
            additions:additions,
            "online":SKU.online && product.online,
            "product_id":product._id};
        var brandName = product.brandName;
        if(!brands[brandName]){
            brands[brandName] = [];
            brandNames.push(brandName);
        }

        totalCount += parseInt(SKUDetail.count);
        if(!SKUDetail.online){
            offlineEntryCount += 1;
            if (brandsOfflineEntryCount[brandName]){
                brandsOfflineEntryCount[brandName]++;
            } else{
                brandsOfflineEntryCount[brandName] = 1;
            }
        }

        brands[brandName].push(SKUDetail);
    }

    goodDetails.datas.total = SKUs.length;
    goodDetails.datas.totalCount = totalCount;
    goodDetails.datas.offlineEntryCount = offlineEntryCount;
    for(var brandNameIndex=0; brandNameIndex<brandNames.length; brandNameIndex++) {
        var brand = {"brandName":brandNames[brandNameIndex], "SKUList":brands[brandNames[brandNameIndex]], offlineEntryCount:brandsOfflineEntryCount[brandNames[brandNameIndex]] || 0};
        goodDetails.datas.rows.push(brand);
    }

    return goodDetails;
}

// get the deliveries of post SKUs in shopping cart
exports.getSKUDeliveries = function(req, res, next) {
    var userId = req.data.userId;
    var checkoutSKUs = req.data.SKUs;
    if (!userId) {
        res.respond({code:1001, message:'请提供正确的参数'});
        return;
    }
    if(!checkoutSKUs || !Array.isArray(checkoutSKUs) || !(checkoutSKUs.length > 0)){
        res.respond({code:1001, message:'请提供正确的参数'});
        return;
    }
    
    CartService.getSKUCategoriesInCart(userId, checkoutSKUs, function(err, categories) {
        if (err || !categories) {
            if (err) console.error('Cart getSKUDeliveries getSKUCategoriesInCart err:', err);
            res.respond({code:1001, message:'查询SKU分类失败'});
            return;
        }
        CategoryService.getDeliveries(categories, function(err, results) {
            if (err || !results) {
                if (err) console.error('Cart getSKUDeliveries getDeliveries err:', err);
                res.respond({code:1001, message:'查询SKU配送方式失败'});
                return;
            }
            res.respond({code:1000, message:'success', datas:{count:results.length, items:results}});
            return;
        });
    });
};
