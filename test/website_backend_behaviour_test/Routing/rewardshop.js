/**
 * Created by zhouxin on 2016/7/6.
 */
var utils = require('../../../common/utils');
var config = require('../../../config');
var request = require('supertest');
var app = require('../../../release');
var should = require('should');

exports.upload_gift_photo = function(token, imgPath, done){
    request(app)
        .post(config.manager_url + '/rewardshop/uploadImage')
        .field('token', token)
        .attach('image', imgPath)
        .end(function(err, res) {
            should.not.exist(err);
            res.should.have.status(200);
            res.should.be.html();
            done(res.text);
        });
};

exports.query_categories = function(category, token, done){
    request(app)
        .get(config.manager_url + '/api/rewardshop/categories')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.save_gift = function(gift, token, done){
    request(app)
        .post(config.manager_url+'/api/rewardshop/gift/add')
        .send(gift)
        .send({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.backend_get_gift = function(gift_id, token, done){
     request(app)
        .get(config.manager_url+'/api/rewardshop/gift/'+gift_id)
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.online_gift = function(gift_id, online, token, done){
    request(app)
        .post(config.manager_url + '/api/rewardshop/gift/update')
        .send({token:token, online:online, _id:gift_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.soldout_gift = function(gift_id, soldout, token, done){
    request(app)
        .post(config.manager_url + '/api/rewardshop/gift/update')
        .send({token:token, soldout:soldout, _id:gift_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_gifts = function(category, page, max, done){
    request(app)
        .get('/api/v2.3/rewardshop/gifts')
        .query({category:category, page:page, max:max})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_gift = function(id, done){
    request(app)
        .get('/api/v2.3/rewardshop/gifts/getGiftDetail')
        .query({id:id})
        .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(200);
            done(res.body);
        })
};

exports.query_category_list = function(done){
    request(app)
        .get('/api/v2.3/rewardshop/gifts/categories')
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.add_gift_order = function(postData, token, done){
    postData = postData ? utils.extend(postData, {token:token}) : {token:token};
    request(app)
        .post('/api/v2.3/rewardshop/addGiftOrder')
        .send(postData)
        .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(200);
            done(res.body);
        })
};