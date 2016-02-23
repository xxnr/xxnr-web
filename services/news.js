/**
 * Created by pepelu on 2015/12/17.
 */
var NewsModel = require('../models').news;
var NewsCategoryModel = require('../models').newsCategory;

// Service
var NewsService = function(){};

// Methods
// Gets listing
NewsService.prototype.query = function(options, callback) {

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

    var queryoptions = {};
    if (options.status)
        queryoptions.status = options.status;
    if (options.category)
        queryoptions.category = options.category;
    if (options.id)
        queryoptions.id = options.id;
    if (options.ids)
        queryoptions.id = {$in: options.ids};
    if (options.skip)
        queryoptions.id = {$not: options.skip};

    if(options.search){
        queryoptions.title = {$regex:new RegExp(options.search)};
    }

    NewsModel.count(queryoptions, function(err, count){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        NewsModel.find(queryoptions)
            .select({newsbody:false})
            .sort({istop:-1, datecreated:-1})
            .skip(skip)
            .limit(take)
            .lean()
            .exec(function(err, docs) {
                if(err){
                    console.error(err);
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
            });
    })
};

// Saves the new into the database
NewsService.prototype.save = function(model, callback) {
    var count = 0;
    var category = null;
    if (!model.id)
        model.id = U.GUID(21);

    // Updates database file
    var queryoptions = {id:model.id};
    var operatoroptions = {};
    if (model.picture)
        operatoroptions.picture = model.picture;
    if (model.category) {
        operatoroptions.category = model.category;
        category = model.category;
    }
    if (model.title)
        operatoroptions.title = model.title;
    if (model.newsbody !== undefined)
        operatoroptions.newsbody = model.newsbody;
    if (model.istop !== undefined)
        operatoroptions.istop = model.istop;
    if (model.abstract !== undefined)
        operatoroptions.abstract = model.abstract;

    NewsModel.update(queryoptions, {$set:operatoroptions}, function(err, numAffected){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(numAffected.n == 0){
            var newNews = new NewsModel(model);
            newNews.save(function(err){
                if(err){
                    console.error(err);
                    callback(err);
                    return;
                }

                callback();
                setTimeout(refresh(category), 1000);
            });
        } else {
            callback();
            setTimeout(refresh(category), 1000);
        }
    });
};

// Gets a specific new
NewsService.prototype.get = function(options, callback) {

    // Gets a specific document from DB
    var queryoptions = {};
    if (options.status)
        queryoptions.status = options.status;
    if (options.category)
        queryoptions.category = options.category;
    if (options.id)
        queryoptions.id = options.id;
    NewsModel.findOne(queryoptions, function(err, doc){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, doc);
    })
};

// Remove new
NewsService.prototype.remove = function(options, callback) {
    var category = null;
    var removeOptions = {};
    if (options && options.id)
        removeOptions.id = options.id;
    if (options && options.category)
        category = options.category;
    NewsModel.find(removeOptions).remove(function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback();
        setTimeout(refresh(category), 1000);
    })
};

// Update new status
NewsService.prototype.updatestatus = function(options, callback) {
    var category = null;
    if (options && options.category) {
        category = options.category;
    }

    var queryoptions = {id:options.id};
    var operatoroptions = {};
    if (options.status)
        operatoroptions.status = options.status;
    NewsModel.update(queryoptions, {$set:operatoroptions}, function(err, numAffected){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(numAffected.n==0){
            callback('not found');
            return;
        }

        callback();
        setTimeout(refresh(category), 1000);
    })
};

// // Clears new database
// New.addWorkflow('clear', function(error, model, options, callback) {

// 	DB('news').clear(function() {
// 		// Refreshes internal information e.g. categories
// 		setTimeout(refresh, 1000);
// 	});

// 	callback(SUCCESS(true));
// });

// Refreshes categories
NewsService.prototype.refresh = function(callback) {
    refresh();
    callback();
};

// Replaces category
NewsService.prototype.category = function(options, callback) {
    var queryoptions = {category:options.category_old};
    var operatoroptions = {};
    if (options.category_new)
        operatoroptions.category = options.category_new;

    NewsModel.update(queryoptions, {$set:operatoroptions}, {multi:true}, function(err, numAffected){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(numAffected.n != 0){
            setTimeout(refresh, 1000);
        }

        callback();
    })
};

// Refreshes internal information (newcategories)
function refresh(categoryname) {
    var categories = {};
    var setcategories = function (doc) {
        var cname = doc.category;
        var status = doc.status;
        var category = {};
        if (!categories[cname]) {
            category['count'] = 1;
            category['status'] = {};
            category['status'][status] = 1;
            categories[cname] = category;
        } else {
            category = categories[cname];
            category['count']++;
            if (!category['status'][status]) {
                category['status'][status] = 1;
            } else {
                category['status'][status]++;
            }
            categories[cname] = category;
        }
    };
    var callback = function () {
        var keys = Object.keys(categories);
        var length = keys.length;
        var arr = new Array(length);

        for (var i = 0; i < length; i++) {
            var cname = keys[i];
            var category = categories[cname];
            var id = cname.slug();
            var cateInfo = {name: cname, id: id, count: category['count']};
            var statuskeys = Object.keys(category['status']);
            cateInfo['status'] = [];
            for (var j = 0; j < statuskeys.length; j++) {
                var status = statuskeys[j];
                cateInfo['status'].push({type:status,count:category['status'][status]});
            }

            saveCategory(cateInfo, function(){});
        }
        // if (categoryname && length === 0) {
        // 	var cateInfo = {name: categoryname, id: categoryname.slug()};
        // 	console.log(cateInfo);
        // 	NEWSCHEMA('Newscategory').remove(cateInfo);
        // }
    };

    var queryOptions = {};
    if (categoryname)
        queryOptions.category = categoryname;
    NewsModel.find(queryOptions, function(err, docs){
        for (var i = 0; i < docs.length; i++) {
            var doc = docs[i];
            setcategories(doc);
        }
        callback();
    })
}

// Saves the news category into the database
var saveCategory = function(model, callback) {
    if (!model.id)
        model.id = model.name.slug();

    var setOptions = {};
    if (model.name)
        setOptions.name = model.name;
    if (model.count)
        setOptions.count = model.count;
    if (model.status)
        setOptions.status = model.status;
    setOptions.dateupdated = new Date();

    NewsCategoryModel.update({id:model.id}, {$set:setOptions}, function(err, numAffected){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(numAffected.n == 0){
            var newCategory = new NewsCategoryModel(model);
            newCategory.save(function(err){
                if(err){
                    console.error(err);
                    callback(err);
                    return;
                }

                callback();
            })
        }

        callback();
    })
};

// Query News category
NewsService.prototype.queryCategory = function(options, callback) {
    var queryoptions = {};
    if (options && options.status)
        queryoptions.status = {$elemMatch: {type:options.status}};

    NewsCategoryModel.find(queryoptions)
        .sort({datecreated:1,dateupdated:-1})
        .exec(function(err, docs){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, docs || []);
        })
};

// Remove News category
// Newscategory.setRemove(function(error, options, callback) {

// 	if (newscategoryDB.type == DB.MONGO_DB) {
// 		var removeOptions = {};
// 		if (options && options.id)
// 			removeOptions.id = options.id;
// 		if (options && options.name)
// 			removeOptions.name = options.name;
// 		if (removeOptions && removeOptions !== {}) {
// 			newscategoryDB.remove({query:removeOptions});
// 			// newscategoryDB.remove({query:removeOptions}, function() {
// 			// 	if (callback && typeof callback === 'function')
// 			// 		callback();
// 			// });
// 		}
// 	} else {
// 		// Filter for removing
// 		var updater = function(doc) {
// 			if (options && options.id && doc.id !== options.id)
// 				return doc;
// 			if (options && options.name && doc.name !== options.name)
// 				return doc;
// 			return null;
// 		};

// 		// Updates database file
// 		newscategoryDB.update(updater);
// 	}

// });

setTimeout(refresh, 1000);
module.exports = new NewsService();
