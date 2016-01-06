/**
 * Created by pepelu on 2015/12/28.
 */
var mongoose = require('mongoose');
var SKUModel = require('../models').SKU;
var SKUAttributeModel = require('../models').SKUAttributes;
var SKUAdditionModel = require('../models').SKUAddition;
var ProductModel = require('../models').product;

// Service
SKUService = function(){};

// Method
/**
 * query price section and rest attributes existence by given product and attributes
 * @param product : product _id
 * @param attributes : array of key value pairs, [{name:'', value:''}, ...]
 * @param callback
 */
queryAttributesAndPrice = function(product, attributes, callback) {
    var names = [];
    var matchOptions = {};

    if (attributes && attributes.length > 0) {
        matchOptions.attributes = {$all:[]};
        attributes.forEach(function (attribute) {
            names.push(attribute.name);
            matchOptions.attributes.$all.push({$elemMatch:attribute});
        });
    }

    if (product)
        matchOptions.product = mongoose.Types.ObjectId(product);

    SKUModel.aggregate({$match: matchOptions}
        , {$unwind: '$attributes'}
        , {
            $group: {
                _id: '$attributes.name',
                values: {$addToSet: '$attributes.value'},
                pricemin: {$min: '$price.platform_price'},
                pricemax: {$max: '$price.platform_price'}
            }
        }
        , {$project: {_id: 0, name: '$_id', values: 1, pricemin: 1, pricemax: 1}}
        )
        .exec(function (err, docs) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            SKUModel.aggregate({$match: matchOptions}
                , {$unwind: '$additions'}
                , {
                    $group: {
                        _id: '$product',
                        additions: {$addToSet: {ref:'$additions.ref', name:'$additions.name', price:'$additions.price'}}
                    }
                })
                .exec(function (err, additionsResult) {
                    if (err) {
                        console.error(err);
                        callback(err);
                        return;
                    }

                    var returns = [];
                    var minPrice = 0, maxPrice = 0;
                    docs.forEach(function (doc) {
                        if (names.indexOf(doc.name) != -1) {
                            return;
                        }

                        minPrice = doc.pricemin;
                        maxPrice = doc.pricemax;
                        delete doc.pricemin;
                        delete doc.pricemax;
                        returns.push(doc);
                    });

                    var additions = [];
                    if(additionsResult && additionsResult.length>0){
                        additions = additionsResult[0].additions;
                    }

                    callback(null, {price: {min: minPrice, max: maxPrice}, attributes: returns, additions:additions});
                });
        });
};

SKUService.prototype.queryAttributesAndPrice = queryAttributesAndPrice;

SKUService.prototype.updateSKU = function(id, price, attributes, additions, name, callback){
    if(!id){
        callback('id required');
        return;
    }

    if(!price || !price.platform_price){
        callback('price.platform_price required');
        return;
    }

    SKUModel.findOneAndUpdate({_id:id}, {$set:{price:price, attributes:attributes, additions:additions, name:name}}, {new:true}, function(err, doc){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        refresh_product_SKUAttributes(doc.product, function(err){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback();
        });
    })
};

SKUService.prototype.addSKU = function(name, product, attributes, additions, price, callback){
    if(!name){
        callback('name required');
        return;
    }

    if(!product){
        callback('product required');
        return;
    }

    if(!price || !price.platform_price){
        callback('price.platform_price required');
        return;
    }

    var newSKU = new SKUModel({name:name, product:product, attributes:attributes, additions:additions, price:price});
    newSKU.save(function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        refresh_product_SKUAttributes(product, function(err){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, newSKU);
        });
    })
};

SKUService.prototype.removeSKU = function(id, callback){
    if(!id){
        callback('id required');
        return;
    }

    SKUModel.findOneAndRemove({_id:id}, function(err, doc){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        refresh_product_SKUAttributes(doc.product, function(err){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback();
        });
    })
};

SKUService.prototype.addSKUAttribute = function(category, brand, name, value, callback){
    if(!category){
        callback('category required');
        return;
    }

    if(!brand){
        callback('brand required');
        return;
    }

    if(!name){
        callback('name required');
        return;
    }

    if(!value){
        callback('value required');
        return;
    }

    var newSKUAttribute = new SKUAttributeModel({category:category, brand:brand, name:name, value:value});
    newSKUAttribute.save(function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, newSKUAttribute);
    })
};

SKUService.prototype.querySKUAttributes = function(category, brand, callback) {
    var queryOptions = {$match:{}};
    if (category)
        queryOptions.$match.category = category;
    if (brand)
        queryOptions.$match.brand = mongoose.Types.ObjectId(brand);

    SKUAttributeModel.aggregate(queryOptions,
        {
            $group: {
                _id: '$name',
                values: {$addToSet: {value:'$value',ref:'$_id'}}
            }
        },
        {$project: {_id: 0, name: '$_id',values: 1}},
        function (err, attributes) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            callback(null, attributes || []);
        })
};

SKUService.prototype.getSKUByProductAndAttributes = function(product, attributes, callback){
    if(!product){
        callback('product _id required');
        return;
    }

    var queryOptions = {product:product};
    if (attributes && attributes.length > 0) {
        queryOptions.attributes = {$all:[]};
        attributes.forEach(function (attribute) {
            queryOptions.attributes.$all.push({$elemMatch:attribute});
        });
    }

    SKUModel.findOne(queryOptions, function(err, SKU){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, SKU);
    })
};

SKUService.prototype.querySKUByProductId = function(product, callback){
    if(!product){
        callback('product _id required');
        return;
    }

    SKUModel.find({product:product}, function(err, SKUs){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, SKUs || []);
    })
};

SKUService.prototype.getSKU = function(id, callback){
    //TODO: get an SKU by _id
};

SKUService.prototype.querySKUAdditions = function(category, brand, callback){
    var queryOptions = {};
    if (category)
        queryOptions.category = category;
    if (brand)
        queryOptions.brand = mongoose.Types.ObjectId(brand);

    SKUAdditionModel.find(queryOptions, function(err, additions){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, additions || []);
    })
};

SKUService.prototype.addSKUAddition = function(category, brand, name, price, callback){
    if(!category){
        callback('category required');
        return;
    }

    if(!brand){
        callback('brand required');
        return;
    }

    if(!name){
        callback('name required');
        return;
    }

    if(!price){
        callback('price required');
        return;
    }

    var newSKUAddition = new SKUAdditionModel({category:category, brand:brand, name:name, price:price});
    newSKUAddition.save(function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, newSKUAddition);
    })
};

var refresh_product_SKUAttributes = function(product, callback){
    queryAttributesAndPrice(product, null, function(err, data){
        if(err){
            callback(err);
            return;
        }

        ProductModel.update({_id:product}, {$set:{SKUPrice:data.price, SKUAttributes:data.attributes, SKUAdditions:data.additions, price:data.price.min}}, function(err, numAffected){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            if(numAffected.n==0){
                callback('product', product, 'not exist');
                return;
            }

            callback();
        })
    })
};

module.exports = new SKUService();