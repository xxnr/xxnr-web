/**
 * Created by pepelu on 2016/7/11.
 */
var models = require('../models');
var CampaignModel = models.campaign;
var QACampaignModel = models.QA_campaign;
var QuizCampaignModel = models.quiz_campaign;
var QuizAnswerModel = models.quiz_answer;
var RewardControlModel = models.reward_control;

var CampaignService = function(){};

CampaignService.prototype.query = function(callback, options){
    var query = {};
    if(options){
        if(options.online){
            query.online = options.online;
        }
        if(options.type){
            query.type = type;
        }
        if(options.search){
            query.title = {$regex:new RegExp(options.search)}
        }
        if(options.status){

        }
    }

    CampaignModel.find(query, function(err, campaigns){
        if(err){
            console.error(err);
            callback(err);
        }

        callback(null, campaigns);
    })
};

module.exports = new CampaignService();