/*
 * Created by zhouxin on 2016/8/18.
 */
var config = require('../config');
var services = require('../services');
var ProductService = services.product;
var ProductModel = require('../models').product;
var CategoryModel = require('../models').category;
var BrandsProductsCollectionModel = require('../models').brandsProductsCollection;
var utils = require('../common/utils');
var converter = require('../common/converter');
var api10 = converter.api10;
var levelName = '车型级别';
var levelListOrder = {"SUV":1, "轿车":2, "MPV":3};
var defaultLevelOrder = levelListOrder.length + 1;
var maxNum = 10;

module.exports = function(callback) {
	CategoryModel.findOne({name:'汽车'}).exec(function(err, category) {
		if(err){
			console.error('generate products by brands, CategoryModel findOne err:', err);
			callback(err);
			return;
		}
		if (category) {
			var queryOptions = {linker_category: category.id, online: true};
			var orderbyOptions = {};
			orderbyOptions.istop = -1;
		    orderbyOptions.online = -1;
		    orderbyOptions.datecreated = -1;
			ProductModel.find(queryOptions)
				.populate('brand')
				.select('id name pictures linker_category presale attributes price deposit SKUPrice brand')
				.sort(orderbyOptions)
				.lean()
				.exec(function(err, docs) {
					if(err){
						console.error('generate products by brands, ProductModel find err:', err);
						callback(err);
						return;
					}
					var brands = {};
					for (var i=0; i<docs.length; i++) {
						var product = docs[i];
						if (!brands[product.brand._id]) {
							brands[product.brand._id] = {ref: product.brand._id, brandId: product.brand._id, brandName: product.brand.name};
							brands[product.brand._id].total = 0;
						}
						if (!brands[product.brand._id].levels) {
							brands[product.brand._id].levels = {};
						}
						for (var j=0; j<product.attributes.length; j++) {
							var attribute = product.attributes[j];
							if (attribute.name == levelName) {
								var key = defaultLevelOrder + attribute.value;
								if (levelListOrder && levelListOrder[attribute.value]) {
									key = levelListOrder[attribute.value] + attribute.value;
								}
								if (!brands[product.brand._id].levels[key]) {
									brands[product.brand._id].levels[key] = {name:attribute.value, order:defaultLevelOrder, products:[]};
									if (levelListOrder && levelListOrder[attribute.value]) {
										brands[product.brand._id].levels[key].order = levelListOrder[attribute.value];
									}
								}
								if (brands[product.brand._id].levels[key].products.length >= maxNum) {
									continue;
								}
								brands[product.brand._id].total += 1;
								brands[product.brand._id].levels[key].products.push(convertProduct(product));
							}
						}
					}
					var promises = [];
					var brandIds = Object.keys(brands);
					for (var i=0; i<brandIds.length; i++) {
						var brandId = brandIds[i];
						var brand = brands[brandId];
						var levelsKeys = Object.keys(brand.levels).sort();
						var levels = [];
						for (var j=0; j<levelsKeys.length; j++) {
							levels.push(brand.levels[levelsKeys[j]]);
						}
						brand.levels = levels;
						promises.push(
							new Promise(function (resolve, reject) {
								ProductService.updateAndSaveBrandsProductsCollection(brand, function (err) {
				                    if (err) {
				                        reject(err);
				                        return;
				                    }

				                    resolve();
				                });
							})
						);
					}
					Promise.all(promises)
	            	.then(function () {
	            		console.log('[', new Date(), '] generate products by brands success. ', brandIds.length, 'brands...');
	            		BrandsProductsCollectionModel.remove({brandId:{$nin:brandIds}}, function (err) {
	                        if (err) {
	                            console.error('[', new Date(), '] generate products by brands, delete fail:', err);
	                            callback(err);
	                            return;
	                        }
	                        callback();
	                        return;
	                    });
	            	})
		            .catch(function (err) {
		                console.error('[', new Date(), '] generate products by brands fail:', err);
		                callback(err);
		            });
				});
		} else {
			console.error('generate products by brands, not find category...');
			callback('generate products by brands, not find category...');
			return;
		}
	});
};

function convertProduct(product) {
	var product = api10.convertProduct(product);
	var data = {
		ref: product._id,
		id: product.id,
		name: product.name,
		unitPrice: product.discountPrice,
		brandId: product.brand._id,
		brandName: product.brand.name,
		imgUrl: product.imgUrl,
		thumbnail: product.thumbnail,
		originalPrice: product.price,
		presale: product.presale ? product.presale : false,
		pictures: product.pictures,
		categoryId: product.categoryId
	};
	return data;
}
