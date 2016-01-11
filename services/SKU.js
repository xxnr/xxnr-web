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
                pricemax: {$max: '$price.platform_price'},
                order: {$max:'$attributes.order'}
            }
        }
        , {$sort: {order:1}}
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

SKUService.prototype.updateSKUAttributeOrder = function(category, brand, name, order, callback){
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

    if(!order){
        callback('order required');
        return;
    }

    SKUAttributeModel.update({category:category, brand:brand._id, name:name}, {$set:{order:order}}, function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        SKUAttributeModel.find({category:category, brand:brand._id, name:name}, function(err, docs){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            var promises = docs.map(function(SKUAttribute){
                return new Promise(function(resolve, reject){
                    SKUAttribute.ref = SKUAttribute._id;
                    SKUModel.update({'attributes.ref': SKUAttribute._id}, {$set: {'attributes.$':SKUAttribute}}, function(err){
                        if(err){
                            reject(err);
                            return;
                        }

                        resolve();
                    });
                })
            });

            Promise.all(promises)
                .then(function(){
                    callback();
                })
                .catch(function(err){
                    callback(err);
                });
        })
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

SKUService.prototype.addSKUAttribute = function(category, brand, name, value, order, callback) {
    if (!category) {
        callback('category required');
        return;
    }

    if (!brand) {
        callback('brand required');
        return;
    }

    if (!name) {
        callback('name required');
        return;
    }

    if (!value) {
        callback('value required');
        return;
    }

    var model = {category: category, brand: brand, name: name, value: value};
    var newSKUAttributeProcessor = function () {
        var newSKUAttribute = new SKUAttributeModel(model);
        newSKUAttribute.save(function (err) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            callback(null, newSKUAttribute);
        })
    };

    if (order) {
        model.order = order;
        newSKUAttributeProcessor();
    } else {
        SKUAttributeModel.aggregate({
            $match: {
                category: category,
                brand: mongoose.Types.ObjectId(brand),
                name: name
            }
        }, {
            $group: {
                _id: {category:'$category', brand:'$brand', name:'$name'},
                order: {$max: '$order'}
            }
        }).exec(function (err, results) {
            console.log(results);
            if (results && results.length > 0) {
                model.order = results[0].order;
                newSKUAttributeProcessor();
            }
        });
    }
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
                values: {$addToSet: {value:'$value',ref:'$_id', order:'$order'}},
                order:{$max:'$order'}
            }
        },
        {$project: {_id: 0, name: '$_id',values: 1, order:1}},
        {$sort:{order:1}},
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
    if(!id){
        callback('id required');
        return;
    }

    SKUModel.findOne({_id:id})
        .populate('product')
        .exec(function(err, SKU){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, SKU);
    })
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

SKUService.prototype.idJoinWithCount = function(options, callback){
    var joinedSKUs = [];
    var SKUs = options.SKUs;

    var joinSKU = function(index){
        if(index >= SKUs.length){
            callback(null, joinedSKUs);
        }
        else {
            var SKU = SKUs[index];
            SKUModel.findOne({_id: SKU._id})
                .populate('product')
                .exec(function (err, doc) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    if (doc) {
                        doc.product.populate('brand', function(err, product){
                            if(err){
                                console.error(err);
                                callback(err);
                                return;
                            }

                            doc.product = product.toObject();
                            doc = doc.toObject();
                            doc.count = SKU.count;
                            doc.additions = SKU.additions;
                            joinedSKUs.push(doc);
                            joinSKU(index + 1);
                        })
                    }else {
                        joinSKU(index + 1);
                    }
                });
        }
    };

    joinSKU(0);
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