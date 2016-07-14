/**
 * Created by pepelu on 2016/7/11.
 */
var services = require('../services');
var CampaignService = services.Campaign;
var path = require('path');

exports.query_campaign = function(req, res, next){
    CampaignService.query(function(err, campaigns){
        if(err){
            res.respond({code:1001, message:'查询活动失败'});
            return;
        }

        res.respond({code:1000, campaigns:campaigns});
    }, {online:true})
};

exports.campaign_page = function(req, res, next){
    var type = req.params.type;
    var name = req.params.name;
    // TODO: render view in /views/campaigns/{type}/{name}, w/ some common

    if (type && name) {
        switch (type){
            case type:
                switch (name){
                    case 'rewardShopLaunch':
                        res.render(path.join(__dirname, '../views/G.campaign/' + type + '/' + name)
                            //{title: "积分商城上线了"}
                        );
                        break;
                    case 'shareAndGetPoints':
                        res.render(path.join(__dirname, '../views/G.campaign/' + type + '/' + name));
                        break;
                    default:
                        res.status(404).send('404: Page not found');
                }
                break;
            default:
                res.status(404).send('404: Page not found');
        }
    } else {
        res.status(404).send('404: Page not found');
        return;
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
        })
    }

    var campaign_status_promise = new Promise(function(resolve, reject){
        CampaignService.campaign_status(campaign_id, function(err, status, message){
            if(err){
                reject(err);
                return;
            }

            campaign_status.status = status;
            campaign_status.message = message;
        })
    });

    Promise.all([user_status_promise, campaign_status_promise])
        .then(function(){
            campaign_status.code = 1000;
            res.respond(campaign_status);
        })
        .catch(function(err){
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
};

exports.query_quiz_question = function(req, res, next){
    //TODO: get quiz question
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

