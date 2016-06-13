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