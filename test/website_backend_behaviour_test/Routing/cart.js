/**
 * Created by pepelu on 2016/6/5.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');

exports.add_to_cart = function(SKU_id, count, token, update_by_add, done){
    request(app)
        .post('/api/v2.1/cart/addToCart')
        .send({SKUId:SKU_id, count:count, token:token, update_by_add:update_by_add})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.update_cart = function(SKU_id, count, token, update_by_add, done){
    request(app)
        .post('/api/v2.1/cart/changeNum')
        .send({SKUId:SKU_id, count:count, token:token, update_by_add:update_by_add})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};
exports.get_cart = function(token, done){
    request(app)
        .get('/api/v2.1/cart/getShoppingCart')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_cart_offline = function(SKUs, done){
    request(app)
        .post('/api/v2.1/cart/getShoppingCartOffline')
        .send({SKUs:SKUs})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_delivery_types = function(SKUs, token, done){
    request(app)
        .post('/api/v2.2/cart/getDeliveries')
        .send({SKUs:SKUs, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

