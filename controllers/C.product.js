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
    F.route('/api/v2.1/products/attributes',              json_products_attributes,              ['get']);
    F.route('/api/v2.1/product/get/{id}',           json_product_get,               ['get']);
    F.route('/api/v2.1/SKU/attributes_and_price/query',   json_SKU_Attributes_query,      ['post']);
    F.route('/api/v2.1/SKU/get',                json_SKU_get,                   ['post']);
};

function json_products_get(){
    //TODO: v2.1 products query
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