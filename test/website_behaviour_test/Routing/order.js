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