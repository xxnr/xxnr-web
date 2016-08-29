/**
 * Created by pepelu on 2016/8/22.
 */
var models = require('../models');
var NominateCategoryModel = models.nominate_category;
var utils = require('../common/utils');
var ProductService = require('./product');

var Nominate_category_service = function(){};

Nominate_category_service.prototype.query = function(options, callback, populate_products, populate_brand){
    var self = this;
    NominateCategoryModel.query(options, function(err, nominate_categories){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(populate_products){
            var results = [];
            var promises = nominate_categories.map(function(nominate_category){
                var query = nominate_category.query;
                if(nominate_category.category) {
                    query.category = nominate_category.category;
                }

                query.page = 1;
                query.max = nominate_category.show_count;
                query.online = true;
                nominate_category = nominate_category.toObject();
                results.push(nominate_category);
                return new Promise(function(resolve, reject){
                    if(nominate_category.products && nominate_category.products.length > 0){
                        nominate_category.products = self.convertProducts(nominate_category.products, nominate_category.show_count);
                        resolve();
                        return;
                    }

                    ProductService.query(query, function(err, products){
                        if(err){
                            reject(err);
                            return;
                        }

                        nominate_category.products = self.convertProducts(products.items, nominate_category.show_count);
                        resolve();
                    })
                })
            });

            Promise.all(promises)
                .then(function(){
                    callback(null, results);
                })
                .catch(function(err){
                    callback(err);
                });
        } else{
            callback(null, nominate_categories || []);
        }
    }, populate_products, populate_brand)
};

Nominate_category_service.prototype.create = function(nominate_category, callback){
    if(!nominate_category){
        callback('nominate_category required');
        return;
    }

    if(nominate_category.category == 'null'){
        nominate_category.category = null;
    }

    if(nominate_category.brand == null || nominate_category.brand == 'null'){
        nominate_category.brand = undefined;
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

    if(nominate_category.category == 'null'){
        nominate_category.category = null;
    }

    if(nominate_category.brand == null || nominate_category.brand == 'null'){
        nominate_category.brand = undefined;
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

Nominate_category_service.prototype.getById = function(_id, callback){
    if(!_id){
        callback('_id required');
        return;
    }

    NominateCategoryModel.findById(_id)
        .populate('products')
        .exec(callback);
};

Nominate_category_service.prototype.convertProducts = function(products, show_count){
    var self = this;
    var result = [];
    var count_added = 0;

    for(var i=0; i<products.length; i++){
        if(products[i].online) {
            result.push(convertProduct(products[i]));
            if(++count_added >= show_count){
                break;
            }
        }
    }

    return result;
};

function convertProduct(product){
    var result = {};
    result.id = product.id;
    result.name = product.name;
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