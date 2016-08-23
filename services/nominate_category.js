/**
 * Created by pepelu on 2016/8/22.
 */
var models = require('../models');
var NominateCategoryModel = models.nominate_category;
var utils = require('../common/utils');

var Nominate_category_service = function(){};

Nominate_category_service.prototype.query = function(options, callback, populate_products){
    NominateCategoryModel.query(options, function(err, nominate_categories){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, nominate_categories || []);
    }, populate_products)
};

Nominate_category_service.prototype.create = function(nominate_category, callback){
    if(!nominate_category){
        callback('nominate_category required');
        return;
    }

    NominateCategoryModel.aggregate({$group:{_id:'', max:{$max:'$order'}}})
        .exec(function(err, result){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            if(result && result[0]) {
                nominate_category.order = result[0].max + 1;
            } else{
                nominate_category.order = 0;
            }

            var new_nominate_category = new NominateCategoryModel(nominate_category);
            new_nominate_category.save(function(err){
                if(err){
                    console.error(err);
                    callback(err);
                    return;
                }

                callback(null, new_nominate_category);
            })
        })
};

Nominate_category_service.prototype.modify = function(nominate_category, callback){
    if(!nominate_category){
        callback('nominate_category required');
        return;
    }

    if(!nominate_category._id){
        callback('nominate_category._id required');
        return;
    }

    var setter = {};
    var canUpdateProperties = ['name', 'category', 'brand', 'search_more', 'show_count', 'products', 'online'];
    canUpdateProperties.forEach(function(canUpdateProperty){
        if(nominate_category.hasOwnProperty(canUpdateProperty)){
            setter[canUpdateProperty] = nominate_category[canUpdateProperty];
        }
    });

    NominateCategoryModel.findOneAndUpdate({_id:nominate_category._id}, {$set:setter}, {new:true}, function(err, new_nominate_category){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, new_nominate_category);
    })
};

Nominate_category_service.prototype.delete = function(nominate_category_id, callback){
    if(!nominate_category_id){
        callback('nominate_category_id required');
        return;
    }

    NominateCategoryModel.findOneAndRemove({_id:nominate_category_id}, function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback();
    })
};

Nominate_category_service.prototype.update_order = function(nominate_category_order, callback){
    if(!nominate_category_order){
        callback('nominate_category_order required');
        return;
    }

    if(!utils.isArray(nominate_category_order)){
        callback('nominate_category_order need to be array');
        return;
    }

    var promises = [];
    for(var i = 0; i < nominate_category_order.length; i++){
        if(nominate_category_order.hasOwnProperty(i)){
            var nominate_category_id = nominate_category_order[i];
            promises.push(new Promise(function(resolve, reject){
                NominateCategoryModel.findOneAndUpdate({_id:nominate_category_id}, {$set:{order:i}}, function(err){
                    if(err){
                        reject(err);
                        return;
                    }

                    resolve();
                })
            }));
        }
    }

    Promise.all(promises)
        .then(function(){
            callback();
        })
        .catch(function(err){
            console.error(err);
            callback(err);
        })
};

Nominate_category_service.prototype.convertProducts = function(products){
    var self = this;
    var result = [];

    for(var i=0; i<products.length; i++){
        if(products[i].online) {
            result.push(convertProduct(products[i]));
        }
    }

    return result;
};

function convertProduct(product){
    var result = {};
    result.id = product.id;
    result.thumbnail = "/images/thumbnail/" + product.linker_category + '/' + product.pictures[0] + ".jpg?category=" + product.linker_category + '&thumb=true';
    result.price = product.SKUPrice.min;
    result.presale = product.presale;
    result.defaultSKU = {
        name:product.defaultSKU.name,
        price:product.defaultSKU.price,
        ref:product.defaultSKU.ref
    };

    return result;
}

module.exports = new Nominate_category_service();