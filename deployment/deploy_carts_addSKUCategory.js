/**
 * Created by zhouxin on 2016/03/02.
 */

require('total.js');
var CartModel = require('../models').cart;
var SKUModel = require('../models').SKU;
var CategoryModel = require('../models').category;
var update_count = 0;
var SKU_count = 0;
var SKU_had = 0;
var count = 0;
var did_SKUs = [];

CartModel.find({})
	.populate('SKU_items.SKU')
	.populate('SKU_items.product')
	.exec(function (err, carts) {
		if (err) {
			console.log('Get all carts err:', err);
			return;
		}
		console.log('All carts num:', carts.length);
	    var cartspromises = carts.map(function(cart) {
	    	return new Promise(function(resolve, reject) {
	    		var SKU_items = cart.SKU_items;
	    		if (SKU_items && SKU_items.length > 0) {
		    		var SKUpromises = SKU_items.map(function(SKU_item) {
		    			return new Promise(function(resolve, reject) {
		    				var cartId = cart.cartId;
		    				var SKUId = SKU_item.SKU._id;
			            	var category = SKU_item.product.linker_category;
			            	if (SKU_item.category) {
			            		SKU_had++;
			            		resolve();
			            	}
			            	CategoryModel.findOne({id:category}, function(err, category) {
			            		if (err) {
			                		// console.log(err);
			                		reject(err);
			                        return;
			                    }
			            		CartModel.update({cartId: cartId, 'SKU_items.SKU': SKUId}, {$set: {'SKU_items.$.category': category['_id']}}, function(err, count) {
			            			if (err) {
				                		// console.log(err);
				                		reject(err);
				                        return;
				                    }
				                    did_SKUs.push({cartId:cartId, SKU: SKUId, categoryId: category['_id']});
				                    SKU_count++;
				                    update_count += count.n;
				                    resolve();
			            		});
			            	});
			           	});
		            });
		            Promise.all(SKUpromises)
			        .then(function() {
			        	count++;
			            resolve();
			        })
			        .catch(function(err) {
			            reject(err);
			        });
	            } else {
	                resolve();
	            }
			});
	    });
	    Promise.all(cartspromises)
        .then(function() {
            console.log('[', new Date(), ']', count, 'carts fixed in total...');
            console.log('[', new Date(), ']', SKU_count, 'carts SKUs fixed in total...');
            console.log('[', new Date(), ']', SKU_had, 'SKUs had categories in total...');
            console.log('[', new Date(), ']', update_count, 'SKUs updated in total...');
            console.log('[', new Date(), ']', did_SKUs, 'updated in total...');
    		process.exit(0);
        })
        .catch(function(err) {
            console.log('[', new Date(), ']', 'carts fixed err:', err);
            console.log('[', new Date(), ']', count, 'carts fixed in total...');
            console.log('[', new Date(), ']', SKU_count, 'carts SKUs fixed in total...');
            console.log('[', new Date(), ']', SKU_had, 'SKUs had categories in total...');
    		process.exit(0);
        });
	});