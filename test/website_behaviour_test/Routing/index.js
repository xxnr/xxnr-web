/**
 * Created by pepelu on 2016/6/2.
 */
var config = require('../../../config');
var request = require('supertest');
var app = require('../../../release');
var should = require('should');

exports.User = require('./user');
exports.Address = require('./address');
exports.Product = require('./product');
exports.Cart = require('./cart');
exports.Order = require('./order');

exports.backend_upload_photo = function(token, imgPath, done){
    request(app)
        .post(config.manager_url+'/upload')
        .field('token', token)
        .attach('image', imgPath)
        .end(function(err, res) {
            should.not.exist(err);
            res.should.have.status(200);
            done(res.body);
        });
};