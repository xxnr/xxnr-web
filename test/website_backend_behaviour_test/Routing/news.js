/**
 * Created by pepelu on 2016/6/14.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');
var config = require('../../../config');

exports.save_news = function(news, token, done){
    request(app)
        .post(config.manager_url+'/api/news')
        .send(news)
        .send({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_news = function(category, done, page, max){
    var body ={category:category};
    if(page)
        body.page = page;
    if(max)
        body.max = max;
    request(app)
        .get('/api/v2.0/news')
        .query(body)
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_news_category = function(done){
    request(app)
        .get('/api/v2.0/news/categories')
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_news_detail = function(id, done){
    request(app)
        .get('/api/v2.0/news/'+id)
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.change_news_status = function(id, status, category, token, done){
    request(app)
        .post(config.manager_url+'/api/news/updatestatus')
        .send({token:token, id:id, status:status, category:category})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.delete_news = function(id, token, done){
    request(app)
        .delete(config.manager_url+'/api/news')
        .send({token:token, id:id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};