/**
 * Created by pepelu on 2016/7/7.
 */
var request = require('supertest');
var app = require('../../../release');
var should = require('should');
var config = require('../../../config');
var models = require('../../../models');
var CampaignModel = models.campaign;

exports.create_campaign = function(token, type, title, online_time, offline_time, start_time, end_time, campaign_url_name, comment, image, shareable, share_points_add, share_button, share_title, share_url_name, share_abstract, share_image, reward_times, detail, done) {
    request(app)
        .post(config.manager_url + '/api/campaign/create')
        .send({
            token: token,
            campaign: {
                type: type,
                title: title,
                online_time: online_time,
                offline_time: offline_time,
                start_time: start_time,
                end_time: end_time,
                campaign_url_name: campaign_url_name,
                comment: comment,
                image: image,
                shareable: shareable,
                share_points_add: share_points_add,
                share_button: share_button,
                share_title: share_title,
                share_url_name: share_url_name,
                share_abstract: share_abstract,
                share_image: share_image,
                reward_times: reward_times,
                detail: detail
            }
        })
        .end(function (err, res) {
            should.not.exist(err);
            done(res.body);
        })
};

exports.modify_campaign = function(token, _id, type, title, online_time, offline_time, start_time, end_time, campaign_url_name, comment, image, shareable, share_points_add, share_button, share_title, share_url_name, share_abstract, share_image, reward_times, detail, done) {
    request(app)
        .post(config.manager_url + '/api/campaign/modify')
        .send({
            token: token,
            campaign: {
                _id: _id,
                type: type,
                title: title,
                online_time: online_time,
                offline_time: offline_time,
                start_time: start_time,
                end_time: end_time,
                campaign_url_name: campaign_url_name,
                comment: comment,
                image: image,
                shareable: shareable,
                share_points_add: share_points_add,
                share_button: share_button,
                share_title: share_title,
                share_url_name: share_url_name,
                share_abstract: share_abstract,
                share_image: share_image,
                reward_times: reward_times,
                detail: detail
            }
        })
        .end(function (err, res) {
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
        .get(config.manager_url + '/api/campaign')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.offline_campaign = function(token, _id, done){
    request(app)
        .post(config.manager_url + '/campaign/offline')
        .send({token:token, _id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_page = function(url, done){
    request(app)
        .get(url)
        .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(200);
            res.should.be.html();
            done(res.text);
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

exports.backend_modify_QA = function(token, _id, QA, done){
    request(app)
        .post(config.manager_url + '/api/campaign/modify')
        .send({token:token, campaign:{_id:_id, detail:QA}})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
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

exports.backend_modify_quiz_question = function(token, _id, questions, done){
    request(app)
        .post(config.manager_url + 'campaign/quiz/question')
        .send({token:token, _id:_id, questions:questions})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.submit_quiz_answer = function(token, _id, answers, done){
    request(app)
        .post('/api/v2.3/campaign/quiz/answer')
        .send({token:token, _id:_id, answers:answers})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_my_quiz_answer = function(token, _id, done){
    request(app)
        .get('/api/v2.3/campaign/quiz/my_answer')
        .query({token:token, _id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.backend_modify_quiz_right_answer = function(token, _id, answers, done){
    request(app)
        .post(config.manager_url + '/api/campaign/quiz/modify_right_answer')
        .send({token:token, _id:_id, answers:answers})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.backend_query_quiz_right_answer = function(token, _id, done){
    request(app)
        .get(config.manager_url + '/api/campaign/quiz/right_answer')
        .query({token:token, _id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_quiz_result = function(token, _id, done){
    request(app)
        .get('/api/v2.3/campaign/quiz/result')
        .query({token:token, _id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.trigger_quiz_reward = function(token, _id, done){
    request(app)
        .post(config.manager_url + '/api/campaign/quiz/trigger_reward')
        .send({token:token, _id:_id})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.delete_all_campaigns = function(done){
    CampaignModel.find({}).remove(done);
};