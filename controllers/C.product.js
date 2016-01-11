/**
 * Created by pepelu on 2015/12/29.
 */
var services = require('../services');
var ProductService = services.product;
var SKUService = services.SKU;
var BrandService = services.brand;

exports.install = function(){
    F.route('/api/v2.1/brands/',                getBrands,                      ['get']);
    F.route('/api/v2.1/products/',              json_products_get,              ['get']);
    F.route('/api/v2.1/product/getProductsListPage', getProductsListPage,       ['post', 'get']);
    F.route('/api/v2.1/products/attributes',              json_products_attributes,              ['get']);
    F.route('/api/v2.1/product/get/{id}',           json_product_get,               ['get']);
    F.route('/api/v2.1/SKU/attributes_and_price/query',   json_SKU_Attributes_query,      ['post']);
    F.route('/api/v2.1/SKU/get',                json_SKU_get,                   ['post']);
};

function json_products_get(){
    var self = this;
    var category = this.query['category'];
    var userId = this.query.userId;
    var max = this.query['max'];

    var options = {online:true};

    if (category)
        options.category = category;

    var page = this.query.page;

    if (page)
        options.page = page;

    if(max)
        options.max = max;

    ProductService.query(options, function(err, data) {
        if(err){
            self.respond({code:1001, message:'查询失败'});
            return;
        }

        self.respond({'code':"1000", "message":"success",
            "products":api10.convertProducts(data.items),
            "userId": userId,
            "category":category
        });
    });
}

function getProductsListPage() {
    var self = this;
    var page = self.data["page"];
    var max = self.data["rowCount"] || self.data["max"];
    var category = self.data["classId"];
    var brandName = self.data["brandName"];
    var reservePrice = self.data["reservePrice"];
    var modelName = self.data["modelName"];
    var sort = self.data["sort"];

    var options = {online:true};

    if (category)
        options.category = category;

    if (page)
        options.page = page;

    if (max)
        options.max = max;

    if (brandName)
        options.brandName = decodeURI(brandName).split(',');

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

    // memorize is designed to work with view rather than api
    // Increases the performance (1 minute cache)
    //self.memorize('cache.' + category + '.' + options.page, '1 minute', DEBUG, function() {
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
        self.respond(goodsListPage);
    });
}

function json_product_get(id){
    //TODO: v2.1 product get
}
function json_products_attributes(){
    var self = this;
    ProductService.getAttributes(self.data.category, self.data.brand, self.data.name, function(err, attributes){
        if (err) {
            console.error('query attributes error', err);
            self.respond({code: 1001, message: '获取商品属性列表失败', error: err});
            return;
        }

        self.respond({code:1000, message:'success', attributes:attributes});
    }, 2)
}

function getBrands(){
    var self = this;
    var category = self.data.category;
    BrandService.query(category, function(err, brands){
        if(err){
            console.error('query brands error', err);
            self.respond({code:1001, message:'获取品牌列表失败', error:err});
            return;
        }

        self.respond({'code': '1000', 'message': 'success', 'brands': brands});
    })
}

function json_SKU_Attributes_query(){
    var self = this;
    SKUService.queryAttributesAndPrice(self.data.product, self.data.attributes, function(err, data){
        if(err){
            console.error('json_SKU_Attributes_query error', err);
            self.respond({code:1001, message:'查询SKU属性价格区间失败'});
            return;
        }

        self.respond({code:1000, message:'success', data:data});
    })
}

function json_SKU_get(){
    var self = this;
    if(!self.data.product){
        self.respond({code:1001, message:'请填写product _id'});
        return;
    }

    SKUService.getSKUByProductAndAttributes(self.data.product, self.data.attributes, function(err, SKU){
        if(err){
            console.error('json_SKU_get error', err);
            self.respond({code:1001, message:'查找SKU失败'});
            return;
        }

        if(!SKU){
            self.respond({code:1001, message:'未找到SKU'});
            return;
        }

        self.respond({code:1000, message:'success', SKU:SKU});
    })
}