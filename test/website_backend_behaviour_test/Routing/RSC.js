/**
 * Created by pepelu on 2016/6/16.
 */
var config = require('../../../config');
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

exports.query_RSC_by_products = function(token, products, province, city, county, town, done, page, max){
    request(app)
        .get('/api/v2.2/RSC')
        .query({products:products, province:province, city:city, county:county, town:town, page:page, max:max, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.fill_RSC_info = function(token, name, IDNo, phone, companyName, companyAddress, done){
    request(app)
        .post('/api/v2.2/RSC/info/fill')
        .send({
            token: token,
            name: name,
            IDNo: IDNo,
            phone: phone,
            companyName: companyName,
            companyAddress: companyAddress
        })
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.modify_RSC_info = function(token, id, products, done){
    request(app)
        .put(config.manager_url + '/api/v2.2/RSC/modify')
        .send({
            token:token,
            id:id,
            products:products
        })
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.confirm_offline_pay = function(token, paymentId, offlinePayType, done){
    request(app)
        .get('/api/v2.2/RSC/confirmOfflinePay')
        .query({token:token, paymentId: paymentId, offlinePayType: offlinePayType})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.deliver_SKU_to_user = function(token, orderId, SKURefs, done){
    request(app)
        .post('/api/v2.2/RSC/order/deliverStatus/delivering')
        .send({token:token, orderId: orderId, SKURefs:SKURefs})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_RSC_province = function(token, products, done){
    request(app)
        .get('/api/v2.2/RSC/address/province')
        .query({token:token, products:products})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_RSC_city = function(token, products, province, done){
    request(app)
        .get('/api/v2.2/RSC/address/city')
        .query({token:token, products:products, province:province})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_RSC_county = function(token, products, province, city, done){
    request(app)
        .get('/api/v2.2/RSC/address/county')
        .query({token:token, products:products, province:province, city:city})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_RSC_town = function(token, products, province, city, county, done){
    request(app)
        .get('/api/v2.2/RSC/address/town')
        .query({token:token, products:products, province:province, city:city, county:county})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};