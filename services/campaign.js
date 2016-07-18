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

const campaign_type_name = {1:'品牌宣传', 2:'答题活动', 3:'竞猜活动'};
const campaign_status_message = {1:'活动尚未上线', 2:'活动还未开始', 3:'活动正在进行', 4:'活动已经结束', 5:'活动已经下线'};
CampaignService.prototype.campaign_type_name = campaign_type_name;
CampaignService.prototype.campaign_status_message = campaign_status_message;
CampaignService.prototype.campaign_url = function(url_name, type){
    var campaign_type_english_name = {1:'events', 2:'QAs', 3:'quizs'};
    return '/campaigns/' + campaign_type_english_name[type] + '/' + url_name;
};

CampaignService.prototype.query = function(options, callback){
    var query = {};
    var currentTime = new Date();
    if(options){
        if(options.online){
            query.online_time = {$lt: currentTime};
            query['$or'] = [{offline_time:{$exists:true, $gt: currentTime}}, {offline_time:{$exists:false}}];
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

CampaignService.prototype.save = function(campaign, callback){
    if(!campaign.title){
        callback('title required');
        return;
    }

    if(!campaign.type){
        callback('type required');
        return;
    }

    if(!campaign.online_time){
        callback('online_time required');
        return;
    }

    if(!campaign.campaign_url_name){
        callback('campaign_url_name required');
        return;
    }

    campaign.url = this.campaign_url(campaign.campaign_url_name, campaign.type);

    if(!campaign.image){
        callback('image required');
        return;
    }

    if(campaign.offline_time && campaign.online_time > campaign.offline){
        callback('上线时间必须大于下线时间');
        return;
    }

    if(campaign.start_time && campaign.end_time && campaign.start_time > campaign.end_time){
        callback('开始时间必须大于结束时间');
        return;
    }

    if(!campaign.start_time && campaign.end_time){
        callback('须填写开始时间');
        return;
    }

    if(campaign.shareable){
        if(!campaign.hasOwnProperty('share_button')){
            callback('share_button required');
            return;
        }
        if(!campaign.share_title){
            callback('share_title required');
            return;
        }
        if(!campaign.share_url_name){
            callback('share_url_name required');
            return;
        }
        if(!campaign.share_abstract){
            callback('share_abstract required');
            return;
        }
        if(!campaign.share_image){
            callback('share_image required');
            return;
        }
    }

    campaign.share_url = this.campaign_url(campaign.share_url_name, campaign.type);

    if(campaign._id){
        // update exists campaign
        CampaignModel.findOneAndUpdate({_id:campaign._id}, {$set:campaign}, {new:true}, function(err, newCampaign){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, newCampaign);
        })
    } else{
        var newCampaign = new CampaignModel(campaign);
        newCampaign.save(function(err){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, newCampaign);
        })
    }
};

CampaignService.prototype.findById = function(_id, callback){
    if(!_id){
        callback('_id required');
        return;
    }

    CampaignModel.findById(_id, function(err, campaign){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, campaign.toObject());
    });
};

CampaignService.prototype.save_detail = function(campaign, callback){
    if(!campaign || !campaign._id){
        callback('require campaign with _id');
        return;
    }

    if(!campaign.detail){
        callback('require campaign with detail');
        return;
    }

    if(!campaign.type){
        callback('require campaign with type');
        return;
    }

    switch(campaign.type){
        case 2:
            // QA
            var newQA = {campaign:campaign, QA:campaign.detail, date_last_modified:new Date()};
            QACampaignModel.findOneAndUpdate({campaign:campaign._id}, {$set:newQA}, {upsert:true, new:true}, function(err, newQACampaign){
                if(err){
                    console.error(err);
                    callback('修改失败');
                    return;
                }

                callback(null, newQACampaign);
            });
            break;
        case 3:
            // quiz
            var newQuiz = {campaign:campaign, QA:campaign.detail, date_last_modified:new Date()};
            QuizCampaignModel.findOneAndUpdate({campaign:campaign._id}, {$set:newQuiz}, {upsert:true, new:true}, function(err, newQuizCampaign){
                if(err){
                    console.error(err);
                    callback('修改失败');
                    return;
                }

                callback(null, newQuizCampaign);
            });
            break;
        default:
            // events and others
            callback('nothing to save');
            break;
    }
};

CampaignService.prototype.queryQA = function(campaign_id, callback){
    QACampaignModel.findOne({campaign:campaign_id}, function(err, QACampaign){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, QACampaign.QA);
    })
};

CampaignService.prototype.query_quiz_question = function(campaign_id, callback){
    QuizCampaignModel.findOne({campaign:campaign_id})
        .select('QA.question QA.type QA.options.value QA.options.order_key QA.order_key QA.points')
        .exec(function(err, QuizCampaign){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, QuizCampaign.QA);
        })
};

CampaignService.prototype.campaign_status = function(campaign_id, callback){
    var self = this;
    CampaignModel.findOne({_id:campaign_id}, function(err, campaign){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        var current_time = new Date();
        var status = 1;
        if(current_time < campaign.online_time){
            status = 1;
        } else if(current_time >= campaign.online_time && current_time < campaign.start_time){
            status = 2;
        } else if(campaign.end_time && current_time >= campaign.start_time && current_time < campaign.end_time){
            status = 3;
        } else if(campaign.end_time && campaign.offline_time && current_time >= campaign.end_time && current_time < campaign.offline_time){
            status = 4;
        } else if(campaign.offline_time && current_time >= campaign.offline_time){
            status = 5;
        }

        callback(null, status, self.campaign_status_message[status]);
    })
};

module.exports = new CampaignService();