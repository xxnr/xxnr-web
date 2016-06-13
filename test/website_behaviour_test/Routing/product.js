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

exports.query_brands = function(token, done){
    request(app)
        .get(config.manager_url + '/api/brands')
        .query({token:token})
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

exports.query_products = function(classId, brand, reservePrice, sort, attributes, done){
    request(app)
        .get('/api/v2.1/product/getProductsListPage')
        .query({classId:classId, brand:brand, reservePrice:reservePrice, sort:sort, attributes:attributes})
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