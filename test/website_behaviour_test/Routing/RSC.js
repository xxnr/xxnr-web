/**
 * Created by pepelu on 2016/6/16.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');

exports.query_RSC_order = function(token, type, search, done, page, max){
    request(app)
        .get('/api/v2.2/RSC/orders')
        .query({token:token ,type:type, search:search, page:page, max:max})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_RSC_order_detail = function(token, orderId, done){
    request(app)
        .get('/api/v2.2/RSC/orderDetail')
        .query({token:token, orderId:orderId})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

