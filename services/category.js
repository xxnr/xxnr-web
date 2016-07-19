/**
 * Created by pepelu on 2015/12/31.
 */
var mongoose = require('mongoose');
var CategoryModel = require('../models').category;
var DELIVERYTYPESORT = require('../common/defs').DELIVERYTYPESORT;

// Service
var CategoryService = function(){};

// Method
CategoryService.prototype.all = function(callback){
    CategoryModel.find({}, function(err, categories){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, categories || []);
    })
};

CategoryService.prototype.getDeliveries = function(categoryIds, callback) {
	if (!categoryIds || categoryIds.length == 0) {
		callback(null, []);
		return;
	}

	var matchOptions = {_id: {$in: categoryIds}};
	
    CategoryModel.aggregate(
    	{$match: matchOptions}
    	, {$unwind: '$deliveries'}
    	, {
            $group: {
                _id: '$deliveries.deliveryType',
                name: {$first: '$deliveries.deliveryName'},
                count: {$sum: 1}
            }
        }
        , {$project: {_id: 0, id: '$_id', name: 1, count: 1}}
        )
    	.exec(function (err, docs) {
        	if (err) {
                console.error(err);
                callback(err);
                return;
            }
            
            var deliveries = [];
            docs.forEach(function (doc) {
            	if (doc.count === categoryIds.length) {
            		deliveries.push({deliveryType: doc.id,deliveryName: doc.name, sort:DELIVERYTYPESORT[doc.id]});
            	}
            });
        	callback(null, deliveries);
    });
};

// Refreshes internal informations (sitemap and navigations)
function refresh() {
    var categories = {};

    if (typeof F != 'undefined' && F.global) {
        CategoryModel.find({}, function(err, docs) {
            if (err) {
                console.error('models category refresh err:', err);
            } else {
                if (docs) {
                    for (var i = 0; i < docs.length; i++) {
                        var doc = docs[i];
                        categories[doc.id] = doc;
                    }
                }
            }
            F.global.mapCategories = categories;
        });
    }
}

setTimeout(refresh, 1000);

module.exports = new CategoryService();