/**
 * Created by pepelu on 2016/1/20.
 */
var IntentionProductModel = require('../models').intention_product;

var IntentionProductService = function(){};

IntentionProductService.prototype.save = function(name, brand, productRef, brandRef, callback){
    IntentionProductModel.update({name:name}, {$set:{name:name, brand:brand, productRef:productRef, brandRef:brandRef}}, {upsert:true}, function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback();
    })
};

IntentionProductService.prototype.query = function(callback, returnCount){
    var projection = {name:1};
    if(returnCount){
        projection.count = 1;
    }
    IntentionProductModel.find({}, projection, function(err, products){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, products || []);
    })
};

IntentionProductService.prototype.query_with_brand = function(callback) {
    IntentionProductModel.aggregate({$match: {}}
        , {
            $group: {
                _id: '$brand',
                products: {$addToSet: '$name'}
            }
        }
        , {
            $project: {
                brand: '$_id',
                _id: false,
                products: 1
            }
        })
        .exec(function (err, results) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            callback(null, results || []);
        });
};

module.exports = new IntentionProductService();