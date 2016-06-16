/**
 * Created by pepelu on 2016/6/5.
 */
var config = require('../../../config');
var request = require('supertest');
var app = require('../../../release');
var should = require('should');

exports.upload_product_photo = function(token, imgPath, done){
    request(app)
        .post(config.manager_url + '/products/uploadImage')
        .field('token', token)
        .attach('image', imgPath)
        .end(function(err, res) {
            should.not.exist(err);
            res.should.have.status(200);
            res.should.be.html();
            done(res.text);
        });
};

exports.save_product = function(product, token, done){
    request(app)
        .post(config.manager_url+'/api/products')
        .send(product)
        .send({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.create_SKU = function(SKU, token, done){
    request(app)
        .post(config.manager_url + '/api/v2.1/SKU/add')
        .send(SKU)
        .send({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_brands = function(category, token, done){
    request(app)
        .get(config.manager_url + '/api/brands')
        .query({category:category, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_SKU_attributes = function(category, brand, token, done){
    request(app)
        .get(config.manager_url + '/api/v2.1/SKU/attributes')
        .query({token:token, category:category, brand:brand})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.online_SKU = function(SKU_id, online, token, done){
    request(app)
        .get(config.manager_url + '/api/v2.1/SKU/online/' + SKU_id)
        .query({token:token, online:online})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.online_product = function(product_id, online, token, done){
    request(app)
        .post(config.manager_url + '/api/products/updateStatus')
        .send({token:token, online:online, _id:product_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_products = function(classId, brands, reservePrice, sort, attributes, done){
    var brandStr = build_brand_string(brands);
    request(app)
        .post('/api/v2.1/product/getProductsListPage')
        .send({classId:classId, brand:brandStr, reservePrice:reservePrice, sort:sort, attributes:attributes})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.web_get_product = function(id, done){
    request(app)
        .get('/api/v2.0/product/getProductDetails')
        .query({goodsId:id})
        .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(200);
            done(res.body);
        })
};

exports.app_get_product = function(id, done){
    request(app)
        .get('/api/v2.0/product/getAppProductDetails')
        .query({productId:id})
        .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(200);
            done(res.body);
        })
};

exports.query_category_list = function(done){
    request(app)
        .get('/api/v2.0/products/categories')
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_product_attributes = function(category, brands, name, done){
    var brandStr = build_brand_string(brands);
    request(app)
        .get('/api/v2.1/products/attributes')
        .query({category:category, brand:brandStr, name:name})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.backend_query_product_attributes = function(category, brands, name, token, done){
    var brandStr = build_brand_string(brands);
    request(app)
        .get(config.manager_url + '/api/products/attributes')
        .query({category:category, brand:brandStr, name:name, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_old_banner = function(done){
    request(app)
        .get('/app/ad/getAdList')
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_SKU_attributes_and_price = function(product_id, attributes, done){
    request(app)
        .post('/api/v2.1/SKU/attributes_and_price/query')
        .send({product:product_id, attributes:attributes})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

function build_brand_string(brands){
    if(!brands){
        return null;
    }

    var brandStr = '';
    brands.forEach(function(brand){
        brandStr += ',' + brand;
    });

    return brandStr.substr(1, brandStr.length-1);
}