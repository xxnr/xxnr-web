/**
 * Created by pepelu on 2015/12/28.
 */
var mongoose = require('mongoose');
var SKUModel = require('../models').SKU;
var SKUAttributeModel = require('../models').SKUAttributes;
var SKUAdditionModel = require('../models').SKUAddition;
var ProductModel = require('../models').product;

// Service
var SKUService = function(){};

// Method
/**
 * query price section and rest attributes existence by given product and attributes
 * @param product : product _id
 * @param attributes : array of key value pairs, [{name:'', value:''}, ...]
 * @param callback
 */
queryAttributesAndPrice = function(product, attributes, callback, online) {
    var names = [];
    var matchOptions = {};
    if (product)
        matchOptions.product = mongoose.Types.ObjectId(product);

    if (typeof online !== 'undefined') {
        matchOptions.online = online;
    }

    if (attributes && attributes.length > 0) {
        matchOptions.attributes = {$all: []};
        attributes.forEach(function (attribute) {
            names.push(attribute.name);
            matchOptions.attributes.$all.push({$elemMatch: attribute});
        });
    }

    SKUModel.aggregate({$match: matchOptions}
        , {$unwind: '$attributes'}
        , {
            $group: {
                _id: '$attributes.name',
                values: {$addToSet: '$attributes.value'},
                pricemin: {$min: '$price.platform_price'},
                pricemax: {$max: '$price.platform_price'},
                marketpricemin: {$min:'$price.market_price'},
                marketpricemax: {$max:'$price.market_price'},
                order: {$max: '$attributes.order'}
            }
        }
        , {$sort: {order: 1}}
        , {$project: {_id: 0, name: '$_id', values: 1, pricemin: 1, pricemax: 1, marketpricemin:1, marketpricemax:1}}
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
                        additions: {
                            $addToSet: {
                                ref: '$additions.ref',
                                name: '$additions.name',
                                price: '$additions.price'
                            }
                        }
                    }
                })
                .exec(function (err, additionsResult) {
                    if (err) {
                        console.error(err);
                        callback(err);
                        return;
                    }

                    var returns = [];
                    var minPrice = 0, maxPrice = 0, marketMinPrice = 0, marketMaxPrice = 0;
                    docs.forEach(function (doc) {
                        if (names.indexOf(doc.name) != -1) {
                            return;
                        }

                        minPrice = doc.pricemin;
                        maxPrice = doc.pricemax;
                        marketMinPrice = doc.marketpricemin;
                        marketMaxPrice = doc.marketpricemax;
                        delete doc.pricemin;
                        delete doc.pricemax;
                        delete doc.marketpricemin;
                        delete doc.marketpricemax;
                        returns.push(doc);
                    });

                    var additions = [];
                    if (additionsResult && additionsResult.length > 0) {
                        additions = additionsResult[0].additions;
                    }
                    var callbackValue = {
                        price: {min: minPrice, max: maxPrice},
                        market_price: {min:marketMinPrice, max:marketMaxPrice},
                        attributes: returns,
                            additions: additions
                    };
                    if (returns.length == 0) {
                        // all attributes selected, should return selected SKU
                        SKUModel.findOne(matchOptions, function (err, SKU) {
                            if (err) {
                                console.error(err);
                                callback(err);
                                return;
                            }

                            if(SKU) {
                                callbackValue.SKU = SKU.toObject();
                                callbackValue.price.min = SKU.price.platform_price;
                                callbackValue.price.max = SKU.price.platform_price;
                                callbackValue.market_price.min = SKU.price.market_price;
                                callbackValue.market_price.max = SKU.price.market_price;
                                callback(null, callbackValue);
                            } else {
                                callback(null, callbackValue);
                            }
                        });
                    } else {
                        callback(null, callbackValue);
                    }
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

    SKUAttributeModel.update({category:category, brand:brand._id, name:name}, {$set:{order:order}}, {multi:true}, function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        SKUAttributeModel.find({category:category, brand:brand._id, name:name})
            .lean()
            .exec(function(err, docs){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            var promises = docs.map(function(SKUAttribute){
                return new Promise(function(resolve, reject){
                    SKUAttribute.ref = SKUAttribute._id;
                    delete SKUAttribute._id;
                    SKUModel.update({'attributes.ref': SKUAttribute.ref}, {$set: {'attributes.$':SKUAttribute}}, function(err){
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

SKUService.prototype.online = function(id, online, callback){
    if(!id){
        callback('id required');
        return;
    }

    if(typeof online == 'undefined'){
        callback('online required');
        return;
    }

    SKUModel.findOneAndUpdate({_id:id}, {$set:{online:online}}, {new:true}, function(err, doc){
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

            callback(null, doc);
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

SKUService.prototype.removeSKUAttributesByName = function(name, callback){
    if(!name){
        callback('name required');
        return;
    }

    // update SKU first
    SKUModel.update({"attributes.name":name}, {$pull:{attributes:{name:name}}}, {multi:true}, function(err, numAffected){
        if(err){
            console.error(err);
            callback(err);
        }

        // delete from SKU attributes
        SKUAttributeModel.find({name:name}).remove(function(err){
            if(err){
                console.error(err);
                callback(err);
            }

            callback();
        });

        // refresh product
        refresh_product_SKUAttributes(null, function(){});
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

    SKUModel.find({product:product})
        .sort({dateCreated:1})
        .exec(function(err, SKUs){
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

                    var item = {SKU:doc.toObject()};
                    if (doc) {
                        doc.product.populate('brand', function(err, product){
                            if(err){
                                console.error(err);
                                callback(err);
                                return;
                            }

                            item.product = product.toObject();
                            item.count = SKU.count;
                            item.additions = SKU.additions;
                            joinedSKUs.push(item);
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

        SKUModel.find({product:product, online:true})
            .sort({dateCreated:1})
            .limit(1)
            .lean()
            .exec(function(err, docs){
                if(err){
                    console.error(err);
                    callback(err);
                    return;
                }

                var setOption = {SKUPrice:data.price, SKUMarketPrice:data.market_price, SKUAttributes:data.attributes, SKUAdditions:data.additions, price:data.price.min};
                if(docs && docs.length == 1){
                    var defaultSKU = docs[0];
                    defaultSKU.ref = defaultSKU._id;
                    delete defaultSKU._id;
                    setOption.defaultSKU = defaultSKU;
                } else{
                    setOption.defaultSKU = null;
                    setOption.online = false;
                }

                ProductModel.update({_id:product}, {$set:setOption}, function(err, numAffected){
                    if(err){
                        console.error(err);
                        callback(err);
                        return;
                    }

                    if(numAffected.n==0){
                        callback('product '+product+' not exist');
                        return;
                    }

                    callback();
                })
            });
    }, true);

    queryAttributesAndPrice(product, null, function(err, data){
        if(err){
            callback(err);
            return;
        }

        SKUModel.find({product:product, online:true})
            .sort({dateCreated:-1})
            .limit(1)
            .lean()
            .exec(function(err, docs){
                if(err){
                    console.error(err);
                    callback(err);
                    return;
                }

                var setOption = {referencePrice:data.price};

                ProductModel.update({_id:product}, {$set:setOption}, function(err, numAffected){
                    if(err){
                        console.error(err);
                        callback(err);
                        return;
                    }

                    if(numAffected.n==0){
                        callback('product '+product+' not exist');
                        return;
                    }

                    callback();
                })
            });
    })
};

SKUService.prototype.querySKUAttributesAndPrice = function(productId, attributes, callback, online) {
    if(!productId){
        // if we don't specify productId, the query will be slow, so we force people to specify productId here
        callback('productId needed');
        return;
    }

    var matchOptions = {product:mongoose.Types.ObjectId(productId)};
    if (typeof online !== 'undefined') {
        matchOptions.online = online;
    }

    var queryAttributes = {};
    if (attributes && attributes.length > 0) {
        matchOptions.attributes = {$all: []};
        attributes.forEach(function (attribute) {
            queryAttributes[attribute.name] = attribute.value;
            matchOptions.attributes.$all.push({$elemMatch: attribute});
        });
    }

    // Get all attributes this product has
    ProductModel.findOne({_id: productId}, function (err, product) {
        var allSKUAttributes = product.SKUAttributes;
        var queryOptions = {};
        var allAttributesSelected = true;
        allSKUAttributes.forEach(function (SKUAttributes) {
            var attributeSelected = false;
            queryOptions[SKUAttributes.name] = {online: true, product: mongoose.Types.ObjectId(productId)};
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].name != SKUAttributes.name) {
                    if (!queryOptions[SKUAttributes.name].attributes) {
                        queryOptions[SKUAttributes.name].attributes = {$all: [{$elemMatch: attributes[i]}]};
                    } else {
                        queryOptions[SKUAttributes.name].attributes.$all.push({$elemMatch: attributes[i]});
                    }
                } else{
                    attributeSelected = true;
                }
            }

            if(!attributeSelected){
                allAttributesSelected = false;
            }
        });

        var promises = [];
        var results = [];
        for (var j in queryOptions) {
            if (queryOptions.hasOwnProperty(j)) {
                var promise = new Promise(function (resolve, reject) {
                    SKUModel.aggregate({$match: queryOptions[j]}
                        , {$unwind: '$attributes'}
                        , {
                            $group: {
                                _id: '$attributes.name',
                                values: {$addToSet: '$attributes.value'},
                                queryKey: {$max: j}
                            }
                        }
                        , {$project: {_id: 0, name: '$_id', values: 1, queryKey: 1}}
                        )
                        .exec(function (err, docs) {
                            if (err) {
                                reject(err);
                                return;
                            }

                            docs.forEach(function (doc) {
                                if (doc.queryKey === doc.name) {
                                    results.push(doc);
                                }
                            });

                            resolve();
                        });
                });

                promises.push(promise);
            }
        }

        Promise.all(promises)
            .then(function () {
                var remainAttributes = [];
                results.forEach(function (result) {
                    delete result.queryKey;
                    remainAttributes.push(result);
                });

                SKUModel.aggregate({$match:matchOptions}
                ,{
                        $group:{
                            _id:'$product',
                            pricemin: {$min: '$price.platform_price'},
                            pricemax: {$max: '$price.platform_price'},
                            marketpricemin: {$min:'$price.market_price'},
                            marketpricemax: {$max:'$price.market_price'}
                        }
                    })
                    .exec(function(err, priceResult){
                        if (err) {
                            console.error(err);
                            callback(err);
                            return;
                        }

                        var pricemin = 0, pricemax = 0, marketpricemin = 0, marketpricemax = 0;
                        if (priceResult && priceResult[0]) {
                            pricemin = priceResult[0].pricemin;
                            pricemax = priceResult[0].pricemax;
                            marketpricemin = priceResult[0].marketpricemin;
                            marketpricemax = priceResult[0].marketpricemax;
                        }

                        SKUModel.aggregate({$match: matchOptions}
                            , {$unwind: '$additions'}
                            , {
                                $group: {
                                    _id: '$product',
                                    additions: {
                                        $addToSet: {
                                            ref: '$additions.ref',
                                            name: '$additions.name',
                                            price: '$additions.price'
                                        }
                                    }
                                }
                            })
                            .exec(function (err, additionsResult) {
                                if (err) {
                                    console.error(err);
                                    callback(err);
                                    return;
                                }

                                var additions = [];
                                if (additionsResult && additionsResult.length > 0) {
                                    additions = additionsResult[0].additions;
                                }

                                var callbackValue = {attributes: remainAttributes,
                                    price: {min: pricemin, max: pricemax},
                                    market_price:{min: marketpricemin, max: marketpricemax},
                                    additions:additions};
                                if(allAttributesSelected) {
                                    // should query one SKU here
                                    SKUModel.findOne(matchOptions)
                                        .lean()
                                        .exec(function (err, SKU) {
                                            if (err) {
                                                console.error(err);
                                                callback(err);
                                                return;
                                            }

                                            callbackValue.SKU = SKU;
                                            callback(null, callbackValue);
                                        });
                                } else {
                                    callback(null, callbackValue);
                                }
                            })
                    })
            })
            .catch(function (err) {
                console.error(err);
                callback(err);
            })
    });
};

SKUService.prototype.refresh_product_SKUAttributes = refresh_product_SKUAttributes;

module.exports = new SKUService();