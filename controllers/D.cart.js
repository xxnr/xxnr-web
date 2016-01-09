/**
 * Created by pepelu on 2016/1/8.
 */
var services = require('../services');
var CartService = services.cart;
var SKUService = services.SKU;

exports.install = function() {
    F.route('/api/v2.1/cart/addToCart', updateShoppingCart, ['post'], ['isLoggedIn']);
    F.route('/api/v2.1/cart/changeNum', updateShoppingCart, ['post'], ['isLoggedIn']);
    F.route('/api/v2.1/cart/getShoppingCartOffline', getShoppingCartOffline, ['post'], ['isLoggedIn']);
};

function updateShoppingCart() {
    var self = this;
    var userId = self.data['userId'];
    var SKUId = self.data['SKUId'];
    var count = self.data['quantity'];
    var update_by_add = self.data['update_by_add'];
    var additions = self.data.additions;
    if (!userId) {
        var response = {code: 1001, message: 'param userId required'};
        self.respond(response);
        return;
    }

    if (!SKUId) {
        var response = ( {code: 1001, message: 'param goodsId required'});
        self.respond(response);
        return;
    }

    if (!count) {
        count = self.data['count'];//This is to support addToCart api
        if (!count) {
            var response = {code: 1001, message: 'param quantity/count required'};
            self.respond(response);
            return;
        }
    }

    if (parseInt(count) > 9999) {
        self.respond({code: 1001, message: '商品个数不能大于9999'});
        return;
    }

    var options = {};
    options.userId = userId;
    options.SKUId = SKUId;

    CartService.getOrAdd(userId, function (err, cart) {
        if (err) {
            self.respond({code: 1001, message: '获取购物车失败'});
            return;
        }

        SKUService.getSKU({_id: SKUId}, function (err, SKU) {
            if (err || !SKU) {
                self.respond({"code": "1001", "message": "无法查找到商品"});
                return;
            }

            if (SKU && SKU.product.presale) {
                self.respond({"code": "1001", "message": "无法添加预售商品"});
                return;
            }

            if (SKU && !SKU.product.online){
                self.respond({code:1001, message:"无法添加下线商品"});
                return
            }

            CartService.updateSKUItems(cart.cartId, SKU._id, count, update_by_add, additions || [], function (err) {
                if (err) {
                    console.log(err);
                    self.respond({code: 1001, message: '更新购物车失败'});
                    return;
                }

                self.respond({code: 1000, message: 'success'});
            })
        }, false);
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