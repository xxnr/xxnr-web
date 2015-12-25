/**
 * Created by pepelu on 2015/12/16.
 */
var ProductModel = require('../models').product;
var sortOptions = {"price-desc":{price:-1},"price-asc":{price:1}};

// Service
ProductService = function(){};

// Methods
// Gets listing
ProductService.prototype.query = function(options, callback) {

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

    var nor = [];

    if (options.category) {
        nor.push({linker_category: {$ne: options.category}});
    }

    if (options.brandName) {
        nor.push({brandName: {$nin: options.brandName}});
    }

    if (options.reservePrice && options.reservePrice.length === 2) {
        if (options.reservePrice[0] !== '')
            nor.push({price: {$lt: parseInt(options.reservePrice[0])}});

        if (options.reservePrice[1] !== '')
            nor.push({price: {$gt: parseInt(options.reservePrice[1])}});
        nor.push({presale: {$eq: true}});
    }

    if (options.modelName)
        nor.push({model: {$nin: options.modelName}});

    if (options.id) {
        nor.push({id: {$ne: options.id}});
    }

    if (options.ids) {
        nor.push({id: {$nin: options.ids}});
    }

    if (options.skip) {
        nor.push({id: options.skip});
    }

    var mongoOptions = nor.length ? {$nor: nor} : {};

    var orderbyOptions = {};
    if (options.sort)
        if (sortOptions[options.sort])
            for (var key in sortOptions[options.sort])
                orderbyOptions[key] = sortOptions[options.sort][key];
    orderbyOptions.istop = -1;
    orderbyOptions.datecreated = -1;

    if(options.search){
        mongoOptions.name = {$regex:new RegExp(options.search)};
    }

    ProductModel.count(mongoOptions, function (err, count) {
        if (err) {
            callback(err);
            return;
        }

        ProductModel.find(mongoOptions)
            .sort(orderbyOptions)
            .skip(skip)
            .limit(take)
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

    if (!model.id)
        model.id = U.GUID(10);

    model.linker = ((model.reference ? model.reference + '-' : '') + model.name).slug();
    model.linker_category = model.category.slug();

    if (model.datecreated)
        model.datecreated = model.datecreated.format();

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

                callback(null);
                setTimeout(refresh, 1000);
            });
        } else {
            callback(null);
            setTimeout(refresh, 1000);
        }
    })
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

setTimeout(refresh, 1000);
module.exports = new ProductService();