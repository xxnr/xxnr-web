/**
 * Created by pepelu on 2016/7/11.
 */
var models = require('../models');
var CampaignModel = models.campaign;
var QACampaignModel = models.QA_campaign;
var QuizCampaignModel = models.quiz_campaign;
var QuizAnswerModel = models.quiz_answer;
var RewardControlModel = models.reward_control;

const CAMPAIGNTYPE = {EVENTS : 1, QA : 2, QUIZ : 3};
const CAMPAIGNSTATUS = {NOTONLINE : 1, NOTSTART : 2, START : 3, END : 4, OFFLINE : 5};
const campaign_type_name = {1:'品牌宣传', 2:'答题活动', 3:'竞猜活动'};
const campaign_status_message = {1:'活动尚未上线', 2:'活动还未开始', 3:'活动正在进行', 4:'活动已经结束', 5:'活动已经下线'};
var CampaignService = function(){
    this.campaign_type_name = campaign_type_name;
    this.campaign_status_message = campaign_status_message;
    this.campaign_type = CAMPAIGNTYPE;
    this.campaign_status = CAMPAIGNSTATUS;
};

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
        callback('上线时间必须早于下线时间');
        return;
    }

    if(campaign.start_time && campaign.online_time > campaign.start_time){
        callback('上线时间必须早于开始时间');
        return;
    }

    if(campaign.start_time && campaign.end_time && campaign.start_time > campaign.end_time){
        callback('开始时间必须早于结束时间');
        return;
    }

    if(!campaign.start_time && campaign.end_time){
        callback('须填写开始时间');
        return;
    }

    if(campaign.start_time && campaign.offline_time && campaign.start_time > campaign.offline_time){
        callback('开始时间必须早于下线时间');
        return;
    }

    if(campaign.end_time && campaign.offline_time && campaign.end_time > campaign.offline_time){
        callback('结束时间必须早于下线时间');
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
        if(err || !campaign){
            console.error(err || 'campaign not found');
            callback(err || 'campaign not found');
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
        case CAMPAIGNTYPE.QA:
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
        case CAMPAIGNTYPE.QUIZ:
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

CampaignService.prototype.get_campaign_status = function(campaign_id, callback){
    var self = this;
    CampaignModel.findOne({_id:campaign_id}, function(err, campaign){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        var current_time = new Date();
        var status = CAMPAIGNSTATUS.NOTONLINE;
        if(current_time < campaign.online_time){
            status = CAMPAIGNSTATUS.NOTONLINE;
        } else if(current_time >= campaign.online_time && current_time < campaign.start_time){
            status = CAMPAIGNSTATUS.NOTSTART;
        } else if(current_time >= campaign.start_time && (campaign.end_time ? current_time < campaign.end_time :true) && (campaign.offline_time? current_time < campaign.offline_time : true)){
            status = CAMPAIGNSTATUS.START;
        } else if(campaign.end_time && current_time >= campaign.end_time && (campaign.offline_time ? current_time < campaign.offline_time : true)){
            status = CAMPAIGNSTATUS.END;
        } else if(campaign.offline_time && current_time >= campaign.offline_time){
            status = CAMPAIGNSTATUS.OFFLINE;
        }

        callback(null, status, self.campaign_status_message[status]);
    })
};

CampaignService.prototype.get_times_left = function(user_id, campaign_id, callback){
    CampaignModel.findOne({_id:campaign_id}, function(err, campaign){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        var total_reward_times = campaign.reward_times;
        RewardControlModel.findOne({user:user_id, campaign:campaign_id}, function(err, rc) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            var reward_times = 0;
            if (rc) {
                reward_times = rc.reward_times;
            }

            var times_left = total_reward_times - reward_times;
            callback(null, times_left >= 0 ? times_left : 0)
        })
    })
};

CampaignService.prototype.QA_check_answers = function(user_id, campaign_id, answers, callback){
    var self = this;
    if(!user_id){
        callback('user_id required');
        return;
    }

    if(!campaign_id){
        callback('campaign_id required');
        return;
    }

    self.get_campaign_status(campaign_id, function(err, status){
        if(err){
            console.error(err);
            callback('提交答案失败');
            return;
        }

        switch(status){
            case self.campaign_status.NOTONLINE:
            case self.campaign_status.NOTSTART:
                callback('活动尚未开始');
                return;
            case self.campaign_status.END:
            case self.campaign_status.OFFLINE:
                callback('活动已经结束');
                return;
            case self.campaign_status.START:
                break;
            default:
                callback('提交答案失败');
                return;
        }

        self.get_times_left(user_id, campaign_id, function(err, times_left){
            if(err){
                console.error(err);
                callback('提交答案失败');
                return;
            }

            if(times_left <= 0){
                callback('already played', 1020);
                return;
            }

            QACampaignModel.findOne({campaign:campaign_id}, function(err, QACampaign){
                if(err || !QACampaign){
                    console.error(err || 'cannot find QA details');
                    callback('提交答案失败');
                    return;
                }

                var points_added = 0;
                var right_answered_questions_count = 0;
                var questions = {};
                QACampaign.QA.forEach(function(question){
                    questions[question.order_key] = {points:question.points, right_answers:[]};
                    question.options.forEach(function(option){
                        if(option.is_right_answer) {
                            questions[question.order_key].right_answers.push(option.order_key);
                        }
                    });
                });

                answers.forEach(function(answer){
                    if(answers_equal(questions[answer.order_key].right_answers, answer.choices)){
                        right_answered_questions_count++;
                        points_added += questions[answer.order_key].points;
                    }
                });

                callback(null, null, points_added, right_answered_questions_count);
            })
        })
    })
};

CampaignService.prototype.record_reward = function(user_id, campaign_id, callback){
    if(!user_id){
        console.error('user_id required');
        return;
    }

    if(!campaign_id){
        console.error('campaign_id required');
        return;
    }

    var reward = {user:user_id, campaign:campaign_id};
    RewardControlModel.update(reward, {$set:reward, $inc:{reward_times:1}}, {upsert:true}, function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback();
    })
};

function answers_equal(a, b){
    var sortChoicesFn = function(a, b){return a<b};
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    a.sort(sortChoicesFn);
    b.sort(sortChoicesFn);
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

module.exports = new CampaignService();