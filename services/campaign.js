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
    }
};

module.exports = new CampaignService();