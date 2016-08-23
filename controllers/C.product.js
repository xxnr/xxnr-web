/**
 * Created by pepelu on 2015/12/29.
 */
var services = require('../services');
var ProductService = services.product;
var SKUService = services.SKU;
var BrandService = services.brand;
var NominateCategoryService = services.nominate_category;
var converter = require('../common/converter');
var api10 = converter.api10;
exports.install = function(){
    //F.route('/api/v2.1/brands/',                getBrands,                      ['get']);
    //F.route('/api/v2.1/products/',              json_products_get,              ['get']);
    //F.route('/api/v2.1/product/getProductsListPage', getProductsListPage,       ['post', 'get']);
    //F.route('/api/v2.1/products/attributes',              json_products_attributes,              ['get']);
    //F.route('/api/v2.1/product/get/{id}',           json_product_get,               ['get']);
    //F.route('/api/v2.1/SKU/attributes_and_price/query',   json_SKU_Attributes_query,      ['post']);
    //F.route('/api/v2.1/SKU/get',                json_SKU_get,                   ['post']);
};

exports.json_products_get = function(req, res, next){
    var category = req.data['category'];
    var userId = req.data.userId;
    var max = req.data['max'];

    var options = {online:true};

    if (category)
        options.category = category;

    var page = req.data.page;

    if (page)
        options.page = page;

    if(max)
        options.max = max;

    ProductService.query(options, function(err, data) {
        if(err){
            res.respond({code:1001, message:'查询失败'});
            return;
        }

        res.respond({'code':"1000", "message":"success",
            "products":api10.convertProducts(data.items),
            "userId": userId,
            "category":category
        });
    });
};

exports.getProductsListPage = function(req, res, next) {
    var page = req.data["page"];
    var max = req.data["rowCount"] || req.data["max"];
    var category = req.data["classId"];
    var brandName = req.data["brandName"];
    var brand = req.data.brand;
    var reservePrice = req.data["reservePrice"];
    var modelName = req.data["modelName"];
    var sort = req.data["sort"];

    var options = {online:true};

    if (category)
        options.category = category;

    if (page)
        options.page = page;

    if (max)
        options.max = max;

    if (brandName)
        options.brandName = decodeURI(brandName).split(',');

    if(brand)
        options.brand = brand.split(',');

    if (reservePrice)
        options.reservePrice = decodeURI(reservePrice).split(',');

    if (modelName) {
        // support old api
        var modelNames = decodeURI(modelName).split(',');
        options.attributes = [];
        modelNames.forEach(function(name){
            options.attributes.push({name:'车系',value:name});
        })
    }

    if (sort)
        options.sort = decodeURI(sort);

    if (req.data.attributes){
        options.attributes = req.data.attributes;
    }
    if (req.data.tags){
        options.tags = decodeURI(req.data.tags).split(',');
    }

    ProductService.query(options, function(err, data) {
        if(err){
            console.log('error occurred while querying products, and the error is ' + err);
            return;
        }

        var products = [];
        var count = data.count;
        var pages = data.pages;
        var page = data.page;

        for(var i = 0; i < data.items.length; i++) {
            var product = api10.convertProduct(data.items[i]);
            var good = {"goodsId":product.id, "awardPoint":"","unitPrice": (product.discountPrice),
                "goodsGreatCount":(product.positiveRating || 1.0) * 100, "brandId": product.brandId,
                "brandName": product.brandName, "imgUrl": product.imgUrl,
                "allowScore": product.payWithScoresLimit,
                "thumbnail": product.thumbnail,
                "stock":"100" /*TODO*/,"originalPrice": product.price, "goodsSellCount": 2/*TODO*/,
                /*"goodsSort":3,*/ "goodsName": product.name,
                "model": product.model,
                "presale": product.presale ? product.presale : false,
                pictures:product.pictures
            };

            products.push(good);
        }

        var goodsListPage = {"code":"1000","message":"success","datas":{total:count, "rows":products,"pages":pages,"page":page}};
        res.respond(goodsListPage);
    });
};

function json_product_get(id){
    //TODO: v2.1 product get
}
exports.json_products_attributes = function(req, res, next){
    ProductService.getAttributes(req.data.category, req.data.brand, req.data.name, function(err, attributes){
        if (err) {
            console.error('query attributes error', err);
            res.respond({code: 1001, message: '获取商品属性列表失败', error: err});
            return;
        }

        res.respond({code:1000, message:'success', attributes:attributes});
    }, 2)
};

exports.getBrands = function(req, res, next){
    var category = req.data.category;
    BrandService.query(category, function(err, brands){
        if(err){
            console.error('query brands error', err);
            res.respond({code:1001, message:'获取品牌列表失败', error:err});
            return;
        }

        res.respond({'code': '1000', 'message': 'success', 'brands': brands});
    })
};

exports.json_SKU_Attributes_query = function(req, res, next){
    SKUService.querySKUAttributesAndPrice(req.data.product, req.data.attributes, function(err, data){
        if(err){
            console.error('json_SKU_Attributes_query error', err);
            res.respond({code:1001, message:'查询SKU属性价格区间失败'});
            return;
        }

        res.respond({code:1000, message:'success', data:data});
    }, true)
};

exports.json_SKU_get = function(req, res, next){
    if(!req.data.product){
        res.respond({code:1001, message:'请填写product _id'});
        return;
    }

    SKUService.getSKUByProductAndAttributes(req.data.product, req.data.attributes, function(err, SKU){
        if(err){
            console.error('json_SKU_get error', err);
            res.respond({code:1001, message:'查找SKU失败'});
            return;
        }

        if(!SKU){
            res.respond({code:1001, message:'未找到SKU'});
            return;
        }

        res.respond({code:1000, message:'success', SKU:SKU});
    })
};

exports.get_nominate_category = function(req, res, next){
    NominateCategoryService.query({online:true}, function(err, nominate_categories){
        if(err){
            res.respond({code:1001, message:'获取推荐类目失败'});
            return;
        }

        var results = [];
        var promises = nominate_categories.map(function(nominate_category){
            nominate_category = nominate_category.toObject();
            results.push(nominate_category);
            return new Promise(function(resolve, reject){
                if(nominate_category.products && nominate_category.products.length > 0){
                    nominate_category.products = NominateCategoryService.convertProducts(nominate_category.products);
                    resolve();
                    return;
                }

                ProductService.query({category:nominate_category.category, brand:nominate_category.brand, page:1, max:nominate_category.show_count, online:true}, function(err, products){
                    if(err){
                        reject(err);
                        return;
                    }

                    nominate_category.products = NominateCategoryService.convertProducts(products.items);
                    resolve();
                })
            })
        });

        Promise.all(promises)
            .then(function(){
                res.respond({code:1000, nominate_categories:results});
            })
            .catch(function(err){
                res.respond({code:1001, message:'获取推荐类目失败'})
            });
    }, true)
};

exports.get_brandsProducts_collection = function(req, res, next){
    ProductService.getBrandsProductsCollection(req.data.brandId, function(err, BrandProducts){
        if(err){
            res.respond({code:1001, message:'获取品牌商品列表失败'});
            return;
        }

        res.respond({code:1000, brandProducts:BrandProducts});
    });
};