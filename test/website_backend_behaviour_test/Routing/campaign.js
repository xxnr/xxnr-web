/**
 * Created by pepelu on 2016/7/7.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');
var config = require('../../../config');

exports.create_campaign = function(token, type, title, online_time, offline_time, start_time, end_time, campaign_url_name, comment, image, shareable, shareButton, shareTitle, shareUrl, shareAbstract, shareImage, detail, done){
    request(app)
        .post(config.manager_url + '/campaign/create')
        .send({token:token, type:type, title:title, online_time:online_time, offline_time:offline_time, start_time:start_time, end_time:end_time, campaign_url_name:campaign_url_name, comment:comment, image:image, shareable:shareable, shareButton:shareButton, shareTitle:shareTitle, shareUrl:shareUrl, shareAbstract:shareAbstract, shareImage:shareImage, detail: detail})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.frontend_query_campaign = function(done){
    request(app)
        .get('/api/v2.3/campaign')
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.backend_query_campaign = function(token, done){
    request(app)
        .get(config.manager_url + '/campaign/')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_campaign_page = function(url, done){
    request(app)
        .get(url)
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.check_campaign_status = function(token, _id, done){
    request(app)
        .get('/api/v2.3/campaign_status')
        .query({token:token, _id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_QA = function(_id, done){
    request(app)
        .get('/api/v2.3/campaign/QA/getQA')
        .query({_id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body)
        })
};

exports.QA_require_reward = function(token, _id, answers, done){
    request(app)
        .post('/api/v2.3/campaign/QA/require_reward')
        .send({token:token, _id:_id, answers:answers})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_quiz_question = function(_id, done){
    request(app)
        .get('/api/v2.3/campaign/quiz/getQ')
        .query({_id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

