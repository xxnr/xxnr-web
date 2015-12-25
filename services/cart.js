/**
 * Created by pepelu on 2015/12/17.
 */
var CartModel = require('../models').cart;

// Service
var CartService = function(){};

// Methods
CartService.prototype.getOrAdd = function(userId, callback, populate){
    var query = CartModel.findOne({userId:userId});
    if(!(populate === false)){
        query = query.populate('items.product', '-_id id price linker_category pictures description discount name deposit brandName');
    }

    query.lean()
    .exec(function(err, cart){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(cart){
            callback(null, cart);
            return;
        }

        var newCart = new CartModel({userId:userId, cartId: U.GUID(10), items:[]});
        newCart.save(function(err){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, newCart);
        })
    })
};

CartService.prototype.updateItems = function(cartId, product_id, count, update_by_add, callback) {
    if(!cartId){
        callback('need cartId');
        return;
    }

    if(!product_id){
        callback('need product_id');
        return;
    }

    if(typeof count == 'undefined'){
        callback('need count');
        return;
    }

    if(!update_by_add && count==0) {
        CartModel.update({cartId:cartId}, {$pull:{items:{product:product_id}}}, {multi:true}, function(err, numAffected){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            if(numAffected.n == 0){
                callback('not found');
                return;
            }

            callback();
        })
    } else if(!update_by_add) {
        CartModel.update({cartId:cartId, 'items.product':product_id}, {$set:{'items.$.count':count}}, function(err, numAffected){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            if(numAffected.n==0){
                callback('not found');
                return;
            }

            callback();
        })
    } else {
        CartModel.update({cartId:cartId, 'items.product':{$ne:product_id}}, {$push:{items:{product:product_id, count:count}}}, function(err, numAffected){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            if(numAffected.n > 0){
                // successfully add one item to array
                // which indicates there is no such product_id
                callback();
                return;
            }

            if(count < 0){
                // if count<0, it means we are removing items
                // we first update those who's count is greater than -count, using $inc
                CartModel.update({cartId:cartId, 'items.product':product_id, 'items.count':{$gt:-count}}, {$inc:{'items.$.count':count}}, function(err, numAffected){
                    if(err){
                        console.error(err);
                        callback(err);
                        return;
                    }

                    var greaterCount = numAffected.n;
                    if(greaterCount>0){
                        callback();
                        return;
                    }

                    // then we update those who's count is equal to -count, using pull
                    CartModel.update({cartId:cartId}, {$pull:{'items.count':-count, 'items.product':product_id}}, function(err, numAffected){
                        if(err){
                            console.error(err);
                            callback(err);
                            return;
                        }

                        if(numAffected.n + greaterCount == 0){
                            callback('not found');
                            return;
                        }

                        callback();
                    })
                })
            } else{
                CartModel.update({cartId:cartId, 'items.product':product_id}, {$inc:{'items.$.count' : count}}, function(err, numAffected){
                    if(err){
                        console.error(err);
                        callback(err);
                        return;
                    }

                    if(numAffected.n == 0){
                        callback('not found');
                        return;
                    }

                    callback();
                })
            }
        })
    }
};

CartService.prototype.removeItems = function(cartId, items, callback) {
    var removeAll = items.length == 0;
    var products = [];
    for (var i = 0; i < items.length; i++) {
        products[items[i].id] = items[i].count;
    }

    if (removeAll) {
        CartModel.update({cartId: cartId}, {$set: {items: []}}, function(err, numAffected){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback();
        });
    } else {
        var updator = function (index) {
            if (index < items.length) {
                var count = items[index].count;
                CartModel.update({cartId: cartId, items:{$elemMatch:{product: items[index]._id, count: {$gt: count}}}}, {$inc: {'items.$.count': -count}}, function (err, numAffected) {
                    if (err) {
                        console.error(err);
                        callback(err);
                        return;
                    }

                    if(numAffected.n >0){
                        updator(index+1);
                        return;
                    }

                    CartModel.update({cartId: cartId}, {$pull: {items: {count: count, product: items[index]._id}}}, function (err, numAffected) {
                        if (err) {
                            console.error(err);
                            callback(err);
                            return;
                        }

                        updator(index + 1);
                    })
                });
            } else{
                callback();
            }
        };

        updator(0);
    }
};

CartService.prototype.checkout = function(cartId, items, callback) {
    var checkoutAll = items.length == 0;
    var productsBuyCount = [];
    for (var i = 0; i < items.length; i++) {
        productsBuyCount[items[i].id] = items[i].count;
    }
    CartModel.findOne({cartId: cartId})
        .populate('items.product', '-support -standard -body')
        .lean()
        .exec(function (err, cart) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            if (checkoutAll) {
                callback(null, cart);
                return;
            }
            var checkoutItems = [];
            for (var j = 0; j < cart.items.length; j++) {
                cart.items[j].count = productsBuyCount[cart.items[j].product.id];
                if (cart.items[j].count) {
                    checkoutItems.push(cart.items[j]);
                }
            }

            cart.items = checkoutItems;
            callback(null, cart);
        })
};

module.exports = new CartService();
