/**
 * Created by pepelu on 2016/6/5.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');

exports.add_order = function(cartId, addressId, SKUs, token, done){
    request(app)
        .post('/api/v2.1/order/addOrder')
        .send({shopCartId:cartId, addressId:addressId, SKUs:SKUs, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.web_query_order = function(token, type, done){
    request(app)
        .get('/api/v2.0/order/getOderList')
        .query({token:token, type:type})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.app_query_order = function(token, type, done){
    request(app)
        .get('/api/v2.0/order/getAppOrderList')
        .query({token:token, type:type})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_order_detail = function(token, orderId, done){
    request(app)
        .get('/api/v2.0/order/getOrderDetails')
        .query({token:token, orderId:orderId})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};
