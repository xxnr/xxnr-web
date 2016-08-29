/*
 * Created by zhouxin on 2016/8/23.
 */
var config = require('../config');
var services = require('../services');
var ProductService = services.product;
var CategoryModel = require('../models').category;
var ProductModel = require('../models').product;
var ProductTagModel = require('../models').productTag;
var utils = require('../common/utils');

console.log('[', new Date(), '] generate product tags values start');
module.exports = function(callback) {
	CategoryModel.findOne({name:'汽车'}).exec(function(err, category) {
		if(err){
			console.error('generate product tags values, CategoryModel findOne err:', err);
			callback(err);
			return;
		}
		if (category) {
			var queryOptions = {linker_category: category.id, online: true};
		    ProductModel.aggregate(
		    	{$match: queryOptions}
		    	, {$unwind: '$tags'}
		    	, {
		            $group: {
		                _id: '$tags.ref',
		                name: {$first: '$tags.name'},
		                count: {$sum: 1}
		            }
		        }
		        , {$project: {_id: 1, name: 1, count: 1}}
		        )
		    	.exec(function (err, docs) {
		        	if (err) {
		                console.error('[', new Date(), '] generate product tags values, aggregate fail:', err);
		                callback(err);
		                return;
		            }
		            var promises = [];
		            var tagIds = [];
		            var i = 1;
		            docs.forEach(function (doc) {
						promises.push(
							new Promise(function (resolve, reject) {
								ProductTagModel.update({_id:doc._id}, {$set:{order:i, productsNum:doc.count}}, function (err) {
				                    if (err) {
				                        reject(err);
				                        return;
				                    }

				                    resolve();
				                });
							})
						);
						tagIds.push(doc._id);
						i += 1;
					});
					Promise.all(promises)
	            	.then(function () {
	            		console.log('[', new Date(), '] generate product tags values success. ', tagIds.length, 'tags...');
	            		ProductTagModel.update({_id:{$nin:tagIds}}, {$set:{order:0, productsNum:0}}, {multi: true}, function (err) {
	                        if (err) {
	                            console.error('[', new Date(), '] generate product tags values, delete fail:', err);
	                            callback(err);
	                            return;
	                        }
	                        callback();
	                        return;
	                    });
	            	})
		            .catch(function (err) {
		                console.error('[', new Date(), '] generate product tags values fail:', err);
		                callback(err);
		            });
				});
		} else {
			console.error('generate product tags values, not find category...');
			callback('generate product tags values, not find category...');
			return;
		}
	});
};