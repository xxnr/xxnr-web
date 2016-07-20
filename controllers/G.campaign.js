/**
 * Created by pepelu on 2016/7/11.
 */
var services = require('../services');
var CampaignService = services.Campaign;
var LoyaltypointService = services.loyaltypoint;
var LOYALTYPOINTSTYPE = require('../common/defs').LOYALTYPOINTSTYPE;
var path = require('path');

exports.query_campaign = function(req, res, next){
    CampaignService.query({online:true}, function(err, campaigns){
        if(err){
            res.respond({code:1001, message:'查询活动失败'});
            return;
        }

        res.respond({code:1000, campaigns:campaigns});
    })
};

exports.campaign_page = function(req, res, next){
    var type = req.params.type;
    var name = req.params.name;

    if (type && name) {
        res.render(path.join(__dirname, '../views/G.campaign/', type, name));
        //switch (type){
        //    case type:
        //        switch (name){
        //            case 'rewardShopLaunch':
        //                res.render(path.join(__dirname, '../views/G.campaign/' + type + '/' + name)
        //                    //{title: "积分商城上线了"}
        //                );
        //                break;
        //            case 'shareAndGetPoints':
        //                res.render(path.join(__dirname, '../views/G.campaign/' + type + '/' + name));
        //                break;
        //            default:
        //                res.status(404).send('404: Page not found');
        //        }
        //        break;
        //    default:
        //        res.status(404).send('404: Page not found');
        //}
    } else {
        res.status(404).send('404: Page not found');
    }


};

exports.campaign_status = function(req, res, next){
    var campaign_id = req.data._id;
    if(!campaign_id){
        res.respond({code:1001, message:'campaign_id required'});
        return;
    }

    var user = req.user;
    var campaign_status = {};
    var promises = [];
    if(user){
        var user_status_promise = new Promise(function(resolve, reject){
            CampaignService.get_times_left(user._id, campaign_id, function(err, times_left){
                if(err){
                    reject(err);
                    return;
                }

                campaign_status.times_left = times_left;
                resolve();
            })
        });
        promises.push(user_status_promise);
    }

    var campaign_status_promise = new Promise(function(resolve, reject){
        CampaignService.get_campaign_status(campaign_id, function(err, status, message){
            if(err){
                reject(err);
                return;
            }

            campaign_status.status = status;
            campaign_status.message = message;
            resolve();
        })
    });
    promises.push(campaign_status_promise);

    Promise.all(promises)
        .then(function(){
            campaign_status.code = 1000;
            res.respond(campaign_status);
        })
        .catch(function(err){
            console.error(err);
            res.respond({code:1001, message:'查询状态错误'});
        })
};

exports.get_QA = function(req, res, next){
    var campaign_id = req.data._id;
    if(!campaign_id){
        res.respond({code:1001, message:'campaign_id required'});
        return;
    }

    CampaignService.queryQA(campaign_id, function(err, QA){
        if(err){
            res.respond({code:1001, message:'查询失败'});
            return;
        }

        res.respond({code:1000, QA:QA});
    })
};

exports.QA_require_reward = function(req, res, next){
    //TODO:QA require reward
    var user = req.user;
    var campaign_id = req.data._id;
    var answers = req.data.answers;

    if(!user){
        res.respond({code:1001, message:'请先登录'});
        return;
    }

    if(!campaign_id){
        res.respond({code:1001, message:'campaign_id required'});
        return;
    }

    if(!answers){
        res.respond({code:1001, message:'answers required'});
        return;
    }

    CampaignService.findById(campaign_id, function(err, campaign){
        if(err){
            console.error(err);
            res.respond({code:1001, message:'提交答案失败'});
            return;
        }

        CampaignService.QA_check_answers(user._id, campaign_id, answers, function(err, code, points_added, right_answered_questions_count){
            if(err){
                console.error(err);
                res.respond({code:code||1001, message:err});
                return;
            }

            LoyaltypointService.increase(user._id, points_added, LOYALTYPOINTSTYPE.COMPAIGNREWARD, campaign.title, campaign._id, function(err){
                CampaignService.record_reward(user._id, campaign_id, function(err){
                    if(err){
                        console.error(err);
                        res.respond({code:1001, message:'提交答案失败'});
                        return;
                    }

                    res.respond({code:1000, points_added:points_added, right_answered_questions_count:right_answered_questions_count});
                })
            })
        })
    })
};

exports.query_quiz_question = function(req, res, next){
    //TODO: get quiz question
    var campaign_id = req.data._id;
    if(!campaign_id){
        res.respond({code:1001, message:'campaign_id required'});
        return;
    }

    CampaignService.query_quiz_question(campaign_id, function(err, questions){
        if(err){
            res.respond({code:1001, message:'查询失败'});
            return;
        }

        res.respond({code:1000, questions:questions});
    })
};

exports.submit_quiz_answer = function(req, res, next){
    //TODO: quiz answer
};

exports.query_my_quiz_answer = function(req, res, next){
    //TODO: query quiz answer
};

exports.query_quiz_result = function(req, res, next){
    //TODO; query quiz result
};

