/**
 * Created by pepelu on 2016/7/11.
 */
var models = require('../models');
var CampaignModel = models.campaign;
var QACampaignModel = models.QA_campaign;
var QuizCampaignModel = models.quiz_campaign;
var QuizAnswerModel = models.quiz_answer;
var RewardControlModel = models.reward_control;
var LoyaltypointService = require('./loyaltypoint');
var LOYALTYPOINTSTYPE = require('../common/defs').LOYALTYPOINTSTYPE;

const CAMPAIGNTYPE = {EVENTS : 1, QA : 2, QUIZ : 3};
const CAMPAIGNSTATUS = {NOTONLINE : 1, NOTSTART : 2, START : 3, END : 4, OFFLINE : 5};
const campaign_type_array = [{id:1, name:'品牌宣传'}, {id:2, name:'答题活动'}, {id:3, name:'竞猜活动'}];
const campaign_type_map = {1:'品牌宣传', 2:'答题活动', 3:'竞猜活动'};
const campaign_status_message = {1:'活动尚未上线', 2:'活动还未开始', 3:'活动正在进行', 4:'活动已经结束', 5:'活动已经下线'};
const batchCount = 10;
var CampaignService = function(){
    this.campaign_type_array = campaign_type_array;
    this.campaign_type_map = campaign_type_map;
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
    var take = 0;
    var skip = 0;
    if(options){
        if(options.online){
            query.online_time = {$lt: currentTime};
            query['$or'] = [{offline_time:{$exists:true, $gt: currentTime}}, {offline_time:{$exists:false}}];
        }
        if(options.type){
            query.type = options.type;
        }
        if(options.search){
            query.title = {$regex:new RegExp(options.search)}
        }
        switch(options.status){
            case CAMPAIGNSTATUS.NOTONLINE:
                query.online_time = {$gt: currentTime};
                break;
            case CAMPAIGNSTATUS.NOTSTART:
                query.online_time = {$lt: currentTime};
                query.start_time = {$gt:currentTime};
                break;
            case CAMPAIGNSTATUS.START:
                query.start_time = {$lt:currentTime};
                if(!query['$or']){
                    query['$or'] = [];
                }
                query['$or'].push({end_time:{$exists:true, $gt: currentTime}});
                query['$or'].push({end_time:{$exists:false}});
                break;
            case CAMPAIGNSTATUS.END:
                query.end_time = {$lt: currentTime};
                if(!query['$or']){
                    query['$or'] = [];
                }
                query['$or'].push({offline_time:{$exists:true, $gt: currentTime}});
                query['$or'].push({offline_time:{$exists:false}});
                break;
            case CAMPAIGNSTATUS.OFFLINE:
                query.offline_time = {$lt: currentTime};
                break;
            default:
                break;
        }
        if(options.max && options.page){
            take = options.max;
            skip = (options.page-1) * options.max;
        }
    }

    CampaignModel.count(query, function(err, count) {
        if (err) {
            console.error(err);
            callback(err);
        }

        var pages = 1;
        if(!take){
            take = count;
        } else{
            pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0)
        }

        CampaignModel.find(query)
            .lean()
            .skip(skip)
            .limit(take)
            .exec(function (err, campaigns) {
                if (err) {
                    console.error(err);
                    callback(err);
                }

                callback(null, campaigns, count, pages);
            })
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

    if(campaign.share_url_name){
        campaign.share_url = this.campaign_url(campaign.share_url_name, campaign.type);
    }

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

CampaignService.prototype.findById = function(_id, callback, findDetail){
    if(!_id){
        callback('_id required');
        return;
    }

    CampaignModel.findById(_id)
        .lean()
        .exec(function(err, campaign){
        if(err || !campaign){
            console.error(err || 'campaign not found');
            callback(err || 'campaign not found');
            return;
        }

        if(findDetail){
            switch(campaign.type){
                case CAMPAIGNTYPE.QA:
                    QACampaignModel.findOne({campaign:campaign._id}, function(err, QACampaign){
                        if(err || !QACampaign){
                            console.error(err || 'campaign detail not found');
                            callback(err || 'campaign detail not found');
                            return;
                        }

                        campaign.detail = QACampaign.QA;
                        callback(null, campaign);
                    });
                    break;
                case CAMPAIGNTYPE.QUIZ:
                    QuizCampaignModel.findOne({campaign:campaign._id}, function(err, QuizCampaign){
                        if(err || !QuizCampaign){
                            console.error(err || 'campaign detail not found');
                            callback(err || 'campaign detail not found');
                            return;
                        }

                        campaign.detail = QuizCampaign.QA;
                        callback(null, campaign);
                    });
            }
        } else{
            callback(null, campaign);
        }
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

        callback(null, QACampaign ? QACampaign.QA : []);
    })
};

CampaignService.prototype.query_quiz_question = function(campaign_id, callback){
    QuizCampaignModel.findOne({campaign:campaign_id})
        .exec(function(err, QuizCampaign){
            if(err || !QuizCampaign){
                console.error(err || 'quiz campaign not found');
                callback(err || 'quiz campaign not found');
                return;
            }

            callback(null, QuizCampaign.QA);
        })
};

CampaignService.prototype.get_campaign_status_by_id = function(campaign_id, callback){
    var self = this;
    CampaignModel.findOne({_id:campaign_id}, function(err, campaign){
        if(err || !campaign){
            console.error(err || 'campaign not found');
            callback(err || 'campaign not found');
            return;
        }

        var status = self.get_campaign_status(campaign);

        callback(null, status, self.campaign_status_message[status]);
    })
};

CampaignService.prototype.get_campaign_status = function(campaign){
    var current_time = new Date();
    var status = CAMPAIGNSTATUS.NOTONLINE;
    if(current_time < new Date(campaign.online_time)){
        status = CAMPAIGNSTATUS.NOTONLINE;
    } else if(current_time >= new Date(campaign.online_time) && current_time < new Date(campaign.start_time)){
        status = CAMPAIGNSTATUS.NOTSTART;
    } else if(current_time >= new Date(campaign.start_time) && (campaign.end_time ? current_time < new Date(campaign.end_time) :true) && (campaign.offline_time? current_time < new Date(campaign.offline_time) : true)){
        status = CAMPAIGNSTATUS.START;
    } else if(new Date(campaign.end_time) && current_time >= new Date(campaign.end_time) && (campaign.offline_time ? current_time < new Date(campaign.offline_time) : true)){
        status = CAMPAIGNSTATUS.END;
    } else if(new Date(campaign.offline_time) && current_time >= new Date(campaign.offline_time)){
        status = CAMPAIGNSTATUS.OFFLINE;
    }

    return status;
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

        callback(null, points_added, right_answered_questions_count);
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

CampaignService.prototype.modify_quiz_right_answer = function(campaign_id, answers, callback){
    if(!campaign_id){
        callback('campaign_id required');
        return;
    }

    if(!answers){
        callback('answers required');
        return;
    }

    QuizCampaignModel.findOne({campaign:campaign_id}, function(err, quizCampaign){
        if(err || !quizCampaign){
            console.error(err || 'quiz not found');
            callback('更新竞猜答案失败，请重试');
            return;
        }

        if(quizCampaign.right_answer_published){
            callback('答案已发布，请勿再次修改答案');
            return;
        }

        answers.forEach(function(answer){
            for(var i=0; i<quizCampaign.QA.length; i++){
                if(answer.order_key == quizCampaign.QA[i].order_key){
                    var right_answer_set = false;
                    quizCampaign.QA[i].options.forEach(function(option){
                        if(answer.choices.indexOf(option.order_key) != -1){
                            option.is_right_answer = true;
                            right_answer_set = true;
                        } else{
                            option.is_right_answer = false;
                        }
                    });

                    quizCampaign.QA[i].right_answer_set = right_answer_set;
                    break;
                }
            }
        });

        quizCampaign.date_last_modified = new Date();
        quizCampaign.save(function(err){
            if(err){
                console.error(err);
                callback('更新竞猜答案失败，请重试');
                return;
            }

            callback();
        })
    })
};

CampaignService.prototype.trigger_quiz_reward = function(campaign_id, callback){
    var self = this;
    if(!campaign_id){
        callback('campaign_id required');
        return;
    }

    self.get_campaign_status_by_id(campaign_id, function(err, status){
        if(!(status == self.campaign_status.END || status == self.campaign_status.OFFLINE)){
            callback('活动尚未结束，无法公布答案');
            return;
        }

        // check if all answers are set
        QuizCampaignModel.find({campaign:campaign_id, 'QA.right_answer_set':false}, function(err,quizCampaign){
            if(err){
                console.error(err);
                callback('公布结果失败，请重试');
                return;
            }

            if(quizCampaign && quizCampaign.length > 0){
                callback('答案未设置完毕');
                return;
            }

            // check if already triggered
            QuizCampaignModel.findOne({campaign:campaign_id}, function(err, quizCampaign){
                if(err || !quizCampaign){
                    console.error(err || 'quiz campaign not found');
                    callback('公布结果失败，请重试');
                    return;
                }

                if(quizCampaign.right_answer_published){
                    callback('结果已经公布，请勿重复操作');
                    return;
                }

                var quiz = {};
                quizCampaign.QA.forEach(function(question){
                    quiz[question.order_key] = {points:question.points, right_answers:[]};
                    question.options.forEach(function(option){
                        if(option.is_right_answer){
                            quiz[question.order_key].right_answers.push(option.order_key);
                        }
                    })
                });

                QuizAnswerModel.find({campaign:campaign_id})
                    .populate('campaign')
                    .exec(function(err, quizAnswers){
                        if(err || !quizAnswers){
                            console.error(err || 'quiz answer not found');
                            callback('公布结果失败，请重试');
                            return;
                        }

                        var userCount = quizAnswers.length;
                        var batchRequireReward = function(i, max){
                            var promises = [];
                            for(; i<max; i++){
                                promises.push(new Promise(function(resolve, reject){
                                    var user = quizAnswers[i];
                                    var points_add = 0;
                                    var right_answer_count = 0;
                                    user.answer.forEach(function (answer) {
                                        if (answers_equal(quiz[answer.order_key].right_answers, answer.choices)) {
                                            // answer right
                                            points_add += quiz[answer.order_key].points;
                                            right_answer_count++;
                                        }
                                    });

                                    LoyaltypointService.increase(user.user, points_add, LOYALTYPOINTSTYPE.COMPAIGNREWARD, quizAnswers[i].campaign.title, quizAnswers[i].campaign._id, function (err) {
                                        if(err){
                                            console.error(err);
                                            reject(err);
                                            return;
                                        }

                                        self.record_reward(user.user, campaign_id, function (err) {
                                            if(err){
                                                console.error(err);
                                                reject(err);
                                                return;
                                            }

                                            QuizAnswerModel.findOneAndUpdate({user:user.user, campaign:campaign_id}, {$set:{result:{has_result:true, points:points_add, right_answer_count:right_answer_count, date_time:new Date()}}}, function(err){
                                                if(err){
                                                    console.error(err);
                                                    reject(err);
                                                    return;
                                                }

                                                resolve();
                                            })
                                        })
                                    })
                                }))
                            }

                            Promise.all(promises)
                                .then(function(){
                                    if(userCount-max>batchCount){
                                        batchRequireReward(max, max + batchCount);
                                    } else if(userCount-max > 0){
                                        batchRequireReward(max, userCount);
                                    } else{
                                        // all finished
                                        quizCampaign.right_answer_published = true;
                                        quizCampaign.save(function(err){
                                            if(err){
                                                callback('公布答案失败');
                                                return;
                                            }

                                            callback()
                                        })
                                    }
                                })
                        };

                        if(userCount > batchCount){
                            batchRequireReward(0, batchCount)
                        } else{
                            batchRequireReward(0, userCount);
                        }
                    })
            })
        })
    })
};

CampaignService.prototype.submit_quiz_answer = function(user_id, campaign_id, answers, callback){
    if(!user_id){
        callback('user_id required');
        return;
    }

    if(!campaign_id){
        callback('campaign_id required');
        return;
    }

    if(!answers){
        callback('answers required');
        return;
    }

    QuizCampaignModel.findOne({campaign:campaign_id}, function(err, quizCampaign) {
        if (err || !quizCampaign) {
            console.error(err || 'quiz campaign not found');
            callback('提交答案失败');
            return;
        }

        if (quizCampaign.QA.length > answers.length) {
            callback('您还有题目未选择答案');
            return;
        }

        var quizAnswer = {user: user_id, campaign: campaign_id, answer: answers, date_last_modified: new Date()};
        QuizAnswerModel.update({
            user: user_id,
            campaign: campaign_id
        }, {$set: quizAnswer}, {upsert: true}, function (err) {
            if (err) {
                console.error(err);
                callback('提交答案失败');
                return;
            }

            callback();
        })
    })
};

CampaignService.prototype.query_my_quiz_answer = function(user_id, campaign_id, callback){
    if(!user_id){
        callback('user_id required');
        return;
    }

    if(!campaign_id){
        callback('campaign_id required');
        return;
    }

    QuizAnswerModel.findOne({user:user_id, campaign:campaign_id}, function(err, myAnswer){
        if(err){
            console.error(err);
            callback('查询失败');
            return;
        }

        callback(null, myAnswer);
    })
};

CampaignService.prototype.canPlay = function(user_id, campaign_id, callback){
    var self = this;
    if(!user_id){
        callback('user_id required');
        return;
    }

    if(!campaign_id){
        callback('campaign_id required');
        return;
    }

    self.get_campaign_status_by_id(campaign_id, function(err, status) {
        if (err) {
            console.error(err);
            callback('提交答案失败');
            return;
        }

        switch (status) {
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

        self.get_times_left(user_id, campaign_id, function (err, times_left) {
            if (err) {
                console.error(err);
                callback('提交答案失败');
                return;
            }

            if (times_left <= 0) {
                callback('already played', 1020);
                return;
            }

            callback();
        })
    })
};

CampaignService.prototype.findByUrl = function(url, callback){
    if(!url){
        callback('url required');
        return;
    }

    CampaignModel.findOne({url:url})
        .exec(function(err, campaign){
        if(err || !campaign){
            console.error(err || 'campaign not found with url ' + url);
            callback('查找活动失败，请重试');
            return;
        }

        callback(null, campaign);
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