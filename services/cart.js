/**
 * Created by pepelu on 2015/12/17.
 */
var CartModel = require('../models').cart;
var SKUModel = require('../models').SKU;

// Service
var CartService = function(){};

// Methods
CartService.prototype.getOrAdd = function(userId, callback, populate){
    var query = CartModel.findOne({userId:userId});
    if(!(populate === false)){
        query = query.populate('items.product', '-_id id price linker_category pictures description discount name deposit brandName');
        query = query.populate('SKU_items.SKU');
        query = query.populate('SKU_items.product');
        query = query.populate('SKU_items.additions');
    }

    query = query.lean();
    query.exec(function(err, cart){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(cart){
            callback(null, cart);
        }else {
            var newCart = new CartModel({userId: userId, cartId: U.GUID(10), items: [], SKU_items: []});
            newCart.save(function (err) {
                if (err) {
                    console.error(err);
                    callback(err);
                    return;
                }

                callback(null, newCart);
            })
        }
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

CartService.prototype.updateSKUItems = function(cartId, SKU_id, count, update_by_add, additions, callback) {
    if(!cartId){
        callback('need cartId');
        return;
    }

    if(!SKU_id){
        callback('need SKU_id');
        return;
    }

    if(typeof count == 'undefined'){
        callback('need count');
        return;
    }

    if(!update_by_add && count==0) {
        // delete
        CartModel.update({cartId:cartId}, {$pull:{items:{SKU:SKU_id}}}, {multi:true}, function(err, numAffected){
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
        // update by replace
        var setOptions = {$set:{'SKU_items.$.count':count}};
        if(additions && additions.length > 0){
            setOptions = {$set:{'SKU_items.$.count':count, 'SKU_items.$.additions':additions}};
        }
        CartModel.update({cartId:cartId, 'SKU_items.SKU':SKU_id}, setOptions, function(err, numAffected){
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
        // update by add
        SKUModel.findOne({_id: SKU_id}, function (err, SKU) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }
            if(!SKU){
                var error = 'update shopping cart error: no such SKU found: ' + SKU_id;
                console.error(error);
                callback(error);
                return;
            }

            var newSKUItem = {SKU: SKU_id, count: count, product: SKU.product};
            if (additions && additions.length > 0) {
                newSKUItem.additions = additions;
            }

            CartModel.update({
                cartId: cartId,
                'SKU_items.SKU': {$ne: SKU_id}
            }, {$push: {SKU_items: newSKUItem}}, function (err, numAffected) {
                if (err) {
                    console.error(err);
                    callback(err);
                    return;
                }

                if (numAffected.n > 0) {
                    // successfully add one item to array
                    // which indicates there is no such SKU_id
                    callback();
                    return;
                }

                if (count < 0) {
                    // if count<0, it means we are removing items
                    // we first update those who's count is greater than -count, using $inc
                    var options = {$inc: {'SKU_items.$.count': count}};
                    options.$set = {'SKU_items.$.product':SKU.product};
                    if (additions && additions.length > 0) {
                        options.$set['SKU_items.$.additions'] = additions;
                    }
                    CartModel.update({
                        cartId: cartId,
                        'SKU_items.SKU': SKU_id,
                        'items.count': {$gt: -count}
                    }, options, function (err, numAffected) {
                        if (err) {
                            console.error(err);
                            callback(err);
                            return;
                        }

                        var greaterCount = numAffected.n;
                        if (greaterCount > 0) {
                            callback();
                            return;
                        }

                        // then we update those who's count is equal to -count, using pull
                        CartModel.update({cartId: cartId}, {
                            $pull: {
                                'items.count': -count,
                                'SKU_items.SKU': SKU_id
                            }
                        }, function (err, numAffected) {
                            if (err) {
                                console.error(err);
                                callback(err);
                                return;
                            }

                            if (numAffected.n + greaterCount == 0) {
                                callback('not found');
                                return;
                            }

                            callback();
                        })
                    })
                } else {
                    options = {$inc: {'SKU_items.$.count': count}};
                    options.$set = {'SKU_items.$.product':SKU.product};
                    if (additions && additions.length > 0) {
                        options.$set['SKU_items.$.additions'] = additions;
                    }

                    CartModel.update({cartId: cartId, 'SKU_items.SKU': SKU_id}, options, function (err, numAffected) {
                        if (err) {
                            console.error(err);
                            callback(err);
                            return;
                        }

                        if (numAffected.n == 0) {
                            callback('not found');
                            return;
                        }

                        callback();
                    })
                }
            })
        });
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

CartService.prototype.removeSKUItems = function(cartId, items, callback) {
    var removeAll = items.length == 0;
    var SKUs = [];
    for (var i = 0; i < items.length; i++) {
        SKUs[items[i].id] = items[i].count;
    }

    if (removeAll) {
        CartModel.update({cartId: cartId}, {$set: {SKU_items: []}}, function(err, numAffected){
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
                CartModel.update({cartId: cartId, SKU_items:{$elemMatch:{SKU: items[index].ref, count: {$gt: count}}}}, {$inc: {'SKU_items.$.count': -count}}, function (err, numAffected) {
                    if (err) {
                        console.error(err);
                        callback(err);
                        return;
                    }

                    if(numAffected.n >0){
                        updator(index+1);
                        return;
                    }

                    CartModel.update({cartId: cartId}, {$pull: {SKU_items: {count: count, SKU: items[index].ref}}}, function (err, numAffected) {
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

CartService.prototype.checkoutSKU = function(cartId, items, callback) {
    var checkoutAll = items.length == 0;
    var SKUBuyCount = [];
    for (var i = 0; i < items.length; i++) {
        SKUBuyCount[items[i].id] = items[i].count;
    }
    CartModel.findOne({cartId: cartId})
        .populate('SKU_items.SKU')
        .populate('SKU_items.product')
        .populate('SKU_items.additions')
        .lean()
        .exec(function (err, cart) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            if (checkoutAll) {
                callback(null, cart);
            } else {
                var checkoutItems = [];
                for (var j = 0; j < cart.SKU_items.length; j++) {
                    cart.SKU_items[j].count = SKUBuyCount[cart.SKU_items[j].SKU._id];
                    if (cart.SKU_items[j].count) {
                        checkoutItems.push(cart.SKU_items[j]);
                    }
                }

                cart.SKU_items = checkoutItems;
                callback(null, cart);
            }
        })
};

module.exports = new CartService();
