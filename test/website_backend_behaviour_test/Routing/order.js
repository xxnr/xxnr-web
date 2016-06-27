/**
 * Created by pepelu on 2016/6/5.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');
var config = require('../../../config');

exports.add_order = function(cartId, addressId, SKUs, token, done, deliveryType, RSCId, consigneePhone, consigneeName){
    request(app)
        .post('/api/v2.1/order/addOrder')
        .send({shopCartId:cartId, addressId:addressId, SKUs:SKUs, token:token, deliveryType:deliveryType, RSCId:RSCId, consigneePhone:consigneePhone, consigneeName:consigneeName})
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

exports.change_RSC = function(token, id, RSCInfo, done){
    request(app)
        .put(config.manager_url + '/api/orders/RSCInfo')
        .send({token:token, id:id, RSCInfo:RSCInfo})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.pay_offline = function(token ,id, done){
    request(app)
        .get('/offlinepay')
        .query({token:token, orderId: id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.deliver_SKU_to_RSC = function(token, id, SKUs, done){
    request(app)
        .put(config.manager_url + '/api/orders/SKUsDelivery')
        .send({token:token, id:id, SKUs:SKUs})
        .end(function(err ,res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_delivery_code = function(token, id, done){
    request(app)
        .get('/api/v2.2/order/getDeliveryCode')
        .query({token:token, orderId:id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.self_delivery = function(token, id, deliveryCode, SKUs, done){
    request(app)
        .post('/api/v2.2/RSC/order/selfDelivery')
        .send({token:token, orderId:id, code:deliveryCode, SKURefs:SKUs})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.confirm_SKU_received = function(token ,orderId, SKURefs, done){
    request(app)
        .post('/api/v2.2/order/confirmSKUReceived')
        .send({token:token, orderId:orderId, SKURefs:SKURefs})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
}