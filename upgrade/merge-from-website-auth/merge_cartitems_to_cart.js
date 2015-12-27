/**
 * Created by pepelu on 2015/12/18.
 */
var config = require('../../configuration/mongoose_config');
var mongoose = require('mongoose');
var CartModel = require('../../models').cart;
var CartItemModel = mongoose.model('cart_item');
var ProductModel = require('../../models').product;
mongoose.connect(config.db[config.environment],{user:'xxnr',pass:'xxnr001'});

CartModel.find({}, function(err, carts){
    if(err){
        console.error(err);
        return;
    }

    var allCarts = carts.map(function(cart){
        return new Promise(function(resolve, reject){
            CartItemModel.find({cartId:cart.cartId}, function(err, docs){
                var items = [];
                if(err){
                    console.error(err);
                    reject(err);
                    return;
                }

                var allItems = docs.map(function(item){
                    return new Promise(function(resolve ,reject){
                        ProductModel.findOne({id:item.productId}, function(err, product){
                            if(err){
                                console.error(err);
                                reject(err);
                                return;
                            }

                            if(product) {
                                items.push({product: product._id, count: item.count});
                            }
                            
                            resolve();
                        })
                    })
                });
                Promise.all(allItems)
                    .then(function(){
                        console.log(items);
                        console.log('query for cart', cart.cartId, 'done. About to push items');
                        CartModel.update({cartId:cart.cartId}, {$set:{items:items}}, function(err, numAffected){
                            if(err){
                                console.error(err);
                                reject(err);
                                return;
                            }

                            resolve();
                        })
                    })
                    .catch(function(){
                        console.error('fail to query cart', cart.cartId, 'About to exit');
                        process.exit(1);
                    })
            })
        })
    });

    Promise.all(allCarts)
        .then(function(){
            console.log('done');
            process.exit(0);
        })
        .catch(function(){
            console.log('fail');
            process.exit(1);
        })
});