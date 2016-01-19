/**
 * Created by pepelu on 2015/12/16.
 */
var mongoose = require('mongoose');
var ProductModel = require('../models').product;
var ProductAttributeModel = require('../models').productAttribute;
var sortOptions = {"price-desc":{price:-1},"price-asc":{price:1}};
var BrandModel = require('../models').brand;

// Service
ProductService = function(){};

// Methods
// Gets listing
ProductService.prototype.query = function(options, callback, oldSchema) {

    // page max num
    var pagemax = 50;
    var max = U.parseInt(options.max, 20);
    options.page = U.parseInt(options.page) - 1;
    options.max = max > pagemax ? pagemax : max;

    if (options.id && typeof(options.id) === 'string')
        options.ids = options.id.split(',');

    if (options.page < 0)
        options.page = 0;

    var take = U.parseInt(options.max);
    var skip = U.parseInt(options.page * options.max);

    var queryOptions = {};
    var nor = [];

    if (options.category) {
        queryOptions.linker_category = options.category;
        nor.push({linker_category: {$ne: options.category}});
    }

    if (options.brandName) {
        queryOptions.brandName = {$in:options.brandName};
        nor.push({brandName: {$nin: options.brandName}});
    }

    if (options.brand){
        queryOptions.brand = {$in:options.brand};
    }

    if (options.reservePrice && options.reservePrice.length === 2) {
        if (options.reservePrice[0] !== ''){
            if(oldSchema) {
                queryOptions['SKUPrice.min'] = {$gte: parseInt(options.reservePrice[0])};
                nor.push({'SKUPrice.min': {$lt: parseInt(options.reservePrice[0])}});
            } else{
                queryOptions.price = {$gte: parseInt(options.reservePrice[0])};
            }
        }

        if (options.reservePrice[1] !== '') {
            if(oldSchema) {
                queryOptions['SKUPrice.max'] = {$lte: parseInt(options.reservePrice[1])};
                nor.push({'SKUPrice.min': {$gt: parseInt(options.reservePrice[1])}});
            } else{
                queryOptions.price.$lte = parseInt(options.reservePrice[1]);
            }
        }

        queryOptions.presale = {$ne: true};
        nor.push({presale: {$eq: true}});
    }

    // support old app
    if (options.modelName)
        queryOptions.model = {$in:options.modelName};

    if(options.attributes){
        queryOptions.attributes = {$all:[]};
        // attributes will be like [{name:'车型级别', value:'轿车'},{name:'汽车车系', value:'瑞风M3'},...]
        options.attributes.forEach(function(attribute){
            queryOptions.attributes.$all.push({$elemMatch:attribute});
        });

        nor.push({attributes:{$nin: options.attributes}});
    }

    if (options.id) {
        queryOptions.id = options.id;
        nor.push({id: {$ne: options.id}});
    }

    if (options.ids) {
        queryOptions.id = {$in:options.ids};
        nor.push({id: {$nin: options.ids}});
    }

    if (options.skip) {
        queryOptions.id = {$nin:options.skip};
        nor.push({id: options.skip});
    }

    if(typeof options.online !== 'undefined'){
        queryOptions.online = options.online;
        nor.push({online: {$ne:options.online}});
    } else{
        //nor.push({online:{$ne:true}});
    }

    var mongoOptions = nor.length ? {$nor: nor} : {};

    var orderbyOptions = {};
    if (options.sort)
        if (sortOptions[options.sort])
            for (var key in sortOptions[options.sort])
                orderbyOptions[key] = sortOptions[options.sort][key];
    orderbyOptions.istop = -1;
    orderbyOptions.online = -1;
    orderbyOptions.datecreated = -1;

    if(options.search){
        queryOptions.name = {$regex:new RegExp(options.search)};
    }

    ProductModel.count(queryOptions, function (err, count) {
        if (err) {
            callback(err);
            return;
        }

        ProductModel.find(queryOptions)
            .sort(orderbyOptions)
            .skip(skip)
            .limit(take)
            .populate('brand')
            .lean()
            .exec(function (err, docs) {
                if(err){
                    console.error('products query error', err, 'options', options);
                    callback(err);
                    return;
                }

                var data = {};
                data.count = count;
                data.items = docs;
                data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);

                if (data.pages === 0)
                    data.pages = 1;

                data.page = options.page + 1;
                callback(null, data || []);
            })
    })
};

// Saves the product into the database
ProductService.prototype.save = function(model, callback) {
    delete model.SKUPrice;
    delete model.SKUAttributes;
    delete model.SKUAdditions;
    delete model.defaultSKU;
    delete model.price;

    if (!model.id)
        model.id = U.GUID(10);

    model.linker = ((model.reference ? model.reference + '-' : '') + model.name).slug();
    model.linker_category = model.category.slug();

    if (model.datecreated)
        model.datecreated = model.datecreated.format();

    var updator = function() {
        // Updates database file
        ProductModel.update({id: model.id}, {$set: model}, function (err, numAffected) {
            if (err) {
                console.error('product save err', err, 'model', model);
                callback(err);
                return;
            }

            if (numAffected.n == 0) {
                var newProduct = new ProductModel(model);
                newProduct.save(function (err) {
                    if (err) {
                        console.error('product save err', err, 'model', model);
                        callback(err);
                        return;
                    }

                    newProduct.populate('brand', function (err, doc) {
                        if (err) {
                            console.error('product populate err', err, 'model', model);
                            callback(err);
                            return;
                        }

                        newProduct.brandName = newProduct.brand.name;
                        newProduct.save(function (err) {
                            if (err) {
                                console.error('product save err', err, 'model', model);
                                callback(err);
                                return;
                            }

                            callback(null, doc);
                            //TODO:call add attributes before new product with new attribute
                            //setTimeout(refresh, 1000);
                        });
                    })
                });
            } else {
                callback(null);
                //setTimeout(refresh, 1000);
            }
        })
    };
    if(model.online) {
        ProductModel.findOne({_id: model._id}, function (err, product) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            if (!product) {
                callback('商品不存在');
                return;
            }

            if (product.SKUAttributes && product.SKUAttributes.length > 0) {
                updator()
            } else {
                callback('该商品没有上线的SKU，无法上线');
                return;
            }
        })
    } else{
        updator();
    }
};

// Gets a specific product
ProductService.prototype.get = function(options, callback) {
    var nor = [];

    if (options.category) {
        nor.push({linker_category: {$ne: options.category}});
    }

    if (options.linker) {
        nor.push({linker: {$ne: options.linker}});
    }

    if (options.id) {
        nor.push({id: {$ne: options.id}});
    }

    var mongoOptions = nor.length ? {$nor: nor} : {};

    // Gets a specific document from DB
    ProductModel.findOne(mongoOptions)
        .populate('brand')
        .lean()
        .exec(function (err, doc) {
            if (err) {
                console.error('product get error', err, 'options', options);
                callback(err);
                return;
            }

            if (!doc) {
                callback('product not found');
                return;
            }

            callback(null, doc);
        })
};

// Removes product
ProductService.prototype.remove = function(id, callback) {
    ProductModel.find({id:id}).remove(function(err){
        callback(err, err? 0 : 1);

        // Refreshes internal information e.g. categories
        setTimeout(refresh, 1000);
    });
};

// Refreshes categories
ProductService.prototype.refresh = function(callback) {
    refresh();
    callback(SUCCESS(true));
};

// Replaces category
ProductService.prototype.category = function(options, callback) {
    var is = false;
    ProductModel.update({category: options.category_old}, {$set:{category:options.category_new, linker_category:options.category_new.slug()}}, { multi: true}, function(err, numAffected){
        if(err){
            console.log('replace category error', err, 'options', options);
            callback(err);
            return;
        }

        if(numAffected.n==0){
            callback('category not found');
            return;
        }

        callback(SUCCESS(true));
        setTimeout(refresh, 1000);
    });
};

// Imports CSV
//Product.addWorkflow('import', function(error, model, filename, callback) {
//    Fs.readFile(filename, function(err, buffer) {
//
//        if (err) {
//            error.push(err);
//            callback();
//            return;
//        }
//
//        buffer = buffer.toString('utf8').split('\n');
//
//        var properties = [];
//        var schema = GETSCHEMA('Product');
//        var isFirst = true;
//        var count = 0;
//
//        buffer.wait(function(line, next) {
//
//            if (!line)
//                return next();
//
//            var data = line.replace(/\"/g, '').split(';')
//            var product = {};
//
//            for (var i = 0, length = data.length; i < length; i++) {
//                var value = data[i];
//                if (!value)
//                    continue;
//
//                if (isFirst)
//                    properties.push(value);
//                else
//                    product[properties[i]] = value;
//            }
//
//            if (isFirst) {
//                isFirst = false;
//                return next();
//            }
//
//            schema.make(product, function(err, model) {
//                if (err)
//                    return next();
//                count++;
//                model.$save(next);
//            });
//        }, function() {
//
//            if (count)
//                refresh();
//
//            // Done, returns response
//            callback(SUCCESS(count > 0));
//        });
//    });
//});

ProductService.prototype.idJoinWithCount = function(options, callback){
    var products = {};
    for(var i=0; i<options.products.length; i++){
        var product = options.products[i];
        products[product.productId] = options.products[i].count;
    }

    var joinedProducts = [];
    var products = options.products;

    var joinProduct = function(index){
        if(index >= products.length){
            callback(null, joinedProducts);
        }
        else {
            var product = products[index];
            ProductModel.findOne({id: product.productId})
                .lean()
                .exec(function (err, doc) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    if (doc) {
                        doc.count = products[index].count;
                        joinedProducts.push(doc);
                    }

                    joinProduct(index + 1);
                });
        }
    };

    joinProduct(0);
};

ProductService.prototype.updateAttributeOrderAndDisplay = function(category, brand, name, order, callback, display){
    if(!category){
        callback('category required');
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

    var setOption = {$set:{order:order}};
    if(typeof display != 'undefined'){
        setOption = {$set:{order:order, display:display}}
    }

    ProductAttributeModel.update({category:category, brand:brand, name:name}, setOption, {multi:true}, function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback();
    })
};

ProductService.prototype.addAttribute = function(category, brand, name, value, order, callback, display){
    if(!category){
        callback('category _id required');
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

    var model = {category:category, brand:brand, name:name, value:value};
    var newAttributeProcessor = function () {
        var productAttribute = new ProductAttributeModel(model);
        productAttribute.save(function(err){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, productAttribute);
        })
    };

    var matchOptions = {
        category: category,
        name: name
    };

    if(brand){
        matchOptions.brand = mongoose.Types.ObjectId(brand);
    }

    if (order || display) {
        if(order) {
            model.order = order;
        }

        if(display){
            model.display = display;
        }

        newAttributeProcessor();
    } else {
        ProductAttributeModel.aggregate({
            $match: matchOptions
        }, {
            $group: {
                _id: {category:'$category', brand:'$brand', name:'$name'},
                order: {$max: '$order'},
                display: {$max: '$display'}
            }
        }).exec(function (err, results) {
            if (results && results.length > 0) {
                model.order = results[0].order;
                model.display = results[0].display;
                newAttributeProcessor();
            }
        });
    }
};

ProductService.prototype.getAttributes = function(category, brand, name, callback, schema){
    var matchOptions = {};
    if(category)
        matchOptions.category = category;
    if(brand){
        if(brand == 0){
            matchOptions.brand = null;
        } else{
            matchOptions.brand = mongoose.Types.ObjectId(brand);
        }
    }
    if(name)
        matchOptions.name = name;

    var schemaToAdd = {name:'$value'};
    switch(schema){
        case 1:
            // backend schema
            schemaToAdd = {value:'$value',ref:'$_id'};
            break;
        case 2:
            // frontend schema
            schemaToAdd = '$value';
            matchOptions.display = true;
            break;
        default:
            // old schema
            matchOptions.display = true;
            break;
    }

    ProductAttributeModel.aggregate({$match:matchOptions},
        {
            $group:
            {
                _id: {brand: '$brand', name: '$name'},
                values: {$addToSet: schemaToAdd},
                order: {$max: '$order'}
            }
        },
        {
            $sort:{order:1}
        }
        , {$project: {_id:1, values: 1}}
    )
        .exec(function(err, attributes){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, attributes || []);
        })
};

ProductService.prototype.updateStatus = function(_id, online, callback){
    if(!_id){
        callback('_id required');
        return;
    }

    if(typeof online === 'undefined'){
        online = false;
    }

    var updator = function(){
        ProductModel.update({_id:_id}, {$set:{online:online}}, function(err, numAffected){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback();
        })
    };

    if(online){
        ProductModel.findOne({_id:_id}, function(err, product){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            if(!product){
                callback('商品不存在');
                return;
            }

            if (product.SKUAttributes && product.SKUAttributes.length > 0){
                updator()
            } else{
                callback('请先添加并上线SKU');
                return;
            }
        })
    } else {
        updator()
    }
};

// Refreshes internal information (categories)
function refresh() {

    var categories = {};
    var brands = {};
    var models = {}, engines = {}, gearboxes = {}, levels = {}; // for car

    var callback = function() {

        var keys = Object.keys(categories);
        var length = keys.length;
        var arr = new Array(length);
        for (var i = 0; i < length; i++) {
            var name = keys[i];
            var linker = name.slug();
            arr[i] = { name: name, linker: linker, count: categories[name] };
        }

        F.global.categories = arr;

        // products attributes
        F.global.attributes = {};

        var keys = Object.keys(brands);
        var length = keys.length;
        var arr = new Array(length);
        for (var i = 0; i < length; i++) {
            var name = keys[i];
            var linker = name.slug();
            arr[i] = { name: name, linker: linker, count: brands[name]['count'] };
            if (brands[name]['category']) {
                var categoryname = brands[name]['category'];
                var categoryid = categoryname.slug();
                arr[i]['category'] = categoryname;
                arr[i]['categoryid'] = categoryid;
            }
        }
        F.global.attributes.brands = arr;

        var keys = Object.keys(models);
        var length = keys.length;
        var arr = new Array(length);
        for (var i = 0, length = keys.length; i < length; i++) {
            var name = keys[i];
            var linker = name.slug();
            arr[i] = { name: name, linker: linker, count: models[name]['count'] };
            if (models[name]['category']) {
                var categoryname = models[name]['category'];
                var categoryid = categoryname.slug();
                arr[i]['category'] = categoryname;
                arr[i]['categoryid'] = categoryid;
            }
        }
        F.global.attributes.models = arr;

        var keys = Object.keys(engines);
        var length = keys.length;
        var arr = new Array(length);
        for (var i = 0, length = keys.length; i < length; i++) {
            var name = keys[i];
            var linker = name.slug();
            arr[i] = { name: name, linker: linker, count: engines[name]['count'] };
            if (engines[name]['category']) {
                var categoryname = engines[name]['category'];
                var categoryid = categoryname.slug();
                arr[i]['category'] = categoryname;
                arr[i]['categoryid'] = categoryid;
            }
        }
        F.global.attributes.engines = arr;

        var keys = Object.keys(gearboxes);
        var length = keys.length;
        var arr = new Array(length);
        for (var i = 0, length = keys.length; i < length; i++) {
            var name = keys[i];
            var linker = name.slug();
            arr[i] = { name: name, linker: linker, count: gearboxes[name]['count'] };
            if (gearboxes[name]['category']) {
                var categoryname = gearboxes[name]['category'];
                var categoryid = categoryname.slug();
                arr[i]['category'] = categoryname;
                arr[i]['categoryid'] = categoryid;
            }
        }
        F.global.attributes.gearboxes = arr;

        var keys = Object.keys(levels);
        var length = keys.length;
        var arr = new Array(length);
        for (var i = 0, length = keys.length; i < length; i++) {
            var name = keys[i];
            var linker = name.slug();
            arr[i] = { name: name, linker: linker, count: levels[name]['count'] };
            if (levels[name]['category']) {
                var categoryname = levels[name]['category'];
                var categoryid = categoryname.slug();
                arr[i]['category'] = categoryname;
                arr[i]['categoryid'] = categoryid;
            }
        }
        F.global.attributes.levels = arr;
    };

    var refreshGroups = function(){
        var groupContainers = [brands, models, engines, gearboxes, levels];
        var groupNames = ["$brandName", "$model", "$engine", "$gearbox", "$level"];

        (function refreshGroup(index){
            if(index >= groupNames.length){
                callback();
            }
            else {
                var container = groupContainers[index];
                var groupName = groupNames[index];

                ProductModel.aggregate([ {
                        $group: {
                            _id: groupName,
                            count: { $sum: 1 },
                            category: {$first: "$category"}
                        }
                    } ],
                    function(error, result){
                        if(error){
                            console.log('error occurred while refreshing ' + groupName + ', and the error is ' + error);
                        }
                        else {
                            var container = groupContainers[index];

                            for (var k = 0; k < ((result && result.length) || 0); k++) {
                                (container[result[k]._id] || (container[result[k]._id] = {}))["count"] = result[k].count;
                                container[result[k]._id]["category"] = result[k].category;
                            }
                        }

                        refreshGroup(index + 1);
                    });
            }
        })(0);
    };

    ProductModel.aggregate([ {
        $group: {
            _id: "$category",
            count: { $sum: 1 }
        }
    } ], function(error, result) {
        if(error){
            console.log('error occurred while refreshing categories, and the error is ' + error);
        }
        else {
            for (var i = 0; i < ((result && result.length) || 0); i++) {
                categories[result[i]._id] = result[i].count;
            }
        }

        refreshGroups();
    } );
}

//setTimeout(refresh, 1000);
module.exports = new ProductService();