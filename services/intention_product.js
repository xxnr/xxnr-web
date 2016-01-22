/**
 * Created by pepelu on 2016/1/20.
 */
var IntentionProductModel = require('../models').intention_product;

var IntentionProductService = function(){};

IntentionProductService.prototype.save = function(name, callback){
    var newIntentionProduct = new IntentionProductModel({name: name});
    newIntentionProduct.save(function (err) {
        if(err){
            if(11000 == err.code){
                callback();
                return;
            }

            console.error(err);
            callback(err);
            return;
        }

        callback();
    });
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

module.exports = new IntentionProductService();