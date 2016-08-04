/**
 * Created by pepelu on 2016/1/20.
 */
var IntentionProductModel = require('../models').intention_product;

var IntentionProductService = function(){};

IntentionProductService.prototype.save = function(name, order, brand, productRef, brandRef, callback){
    IntentionProductModel.update({name:name}, {$set:{name:name, order:order, brand:brand, productRef:productRef, brandRef:brandRef}}, {upsert:true}, function(err){
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
    IntentionProductModel.find({})
        .sort({order:1})
        .exec(function(err, products){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            var brands = {};
            products.forEach(function(product){
                if(brands[product.brand]) {
                    brands[product.brand].products.push({name: product.name, _id: product._id});
                } else{
                    brands[product.brand] = {products:[{name:product.name, _id:product._id}]};
                }
            });

            var results = [];
            var hasOtherBrand = false;
            for(var i in brands){
                if(brands.hasOwnProperty(i)){
                    var brand = brands[i];
                    if(i == '其他'){
                        hasOtherBrand = true;
                        continue;
                    }

                    results.push({brand:i, products:brand.products});
                }
            }

            if(hasOtherBrand){
                results.push({brand:'其他', products:brands['其他'].products});
            }

            callback(null, results);
        })
};

module.exports = new IntentionProductService();