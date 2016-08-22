/**
 * Created by pepelu on 2016/8/18.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');
var config = require('../../../config');

exports.query_nominate_category_frontend = function(done){
    request(app)
        .get('/api/v2.4/nominate_category')
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_nominate_category_backend = function(token, done){
    request(app)
        .get(config.manager_url+'/api/nominate_category/query')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.create_nominate_category = function(nominate_category, token, done){
    request(app)
        .post(config.manager_url+'/api/nominate_category/save')
        .send({nominate_category:nominate_category, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body)
        })
};

exports.modify_nominate_category = function(nominate_category, token, done){
    request(app)
        .post(config.manager_url+'/api/nominate_category/modify')
        .send({nominate_category:nominate_category, token:token})
        .end(function(err, res) {
            should.not.exist(err);
            done(res.body);
        })
};

exports.delete_nominate_category = function(nominate_category_id, token, done){
    request(app)
        .delete(config.manager_url+'/api/nominate_category/delete')
        .send({_id:nominate_category_id, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.update_nominate_category_order = function(nominate_category_order, token, done){
    request(app)
        .post(config.manager_url+'/api/nominate_category/update_order')
        .send({nominate_category_order:nominate_category_order, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};