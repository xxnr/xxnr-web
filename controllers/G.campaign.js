/**
 * Created by pepelu on 2016/7/11.
 */
var services = require('../services');
var CampaignService = services.Campaign;
var LoyaltypointService = services.loyaltypoint;
var LOYALTYPOINTSTYPE = require('../common/defs').LOYALTYPOINTSTYPE;
var path = require('path');
var tools = require('../common/tools');
var URL = require('url');

exports.query_campaign = function(req, res, next){
    CampaignService.query({online:true}, function(err, campaigns){
        if(err){
            res.respond({code:1001, message:'查询活动失败'});
            return;
        }

        var prevurl = getPrevUrl(req);
        var previmg = getprevImg(req);
        var imgtype = '.jpg';
        campaigns.forEach(function(campaign){
            delete campaign.type;
            delete campaign.campaign_url_name;
            delete campaign.comment;
            delete campaign.share_points_add;
            delete campaign.__v;

            campaign.share_button = campaign.shareable && campaign.share_button;

            delete campaign.shareable;

            if(campaign.image){
                campaign.image = previmg + campaign.image + imgtype;
            }
            if(campaign.share_image){
                campaign.share_image = previmg + campaign.share_image + imgtype;
            }
            if(campaign.url){
                campaign.url = prevurl + campaign.url;
            }
            if(campaign.share_url){
                campaign.share_url = prevurl + campaign.share_url;
            }
        });
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
            res.respond({code:1001, message:'提交答案失败'});
            return;
        }

        CampaignService.canPlay(user._id, campaign_id, function(err, code) {
            if(err){
                res.respond({code: code || 1001, message: err});
                return;
            }

            CampaignService.QA_check_answers(user._id, campaign_id, answers, function (err, points_added, right_answered_questions_count) {
                if (err) {
                    res.respond({code: 1001, message: err});
                    return;
                }

                if(points_added) {
                    LoyaltypointService.increase(user._id, points_added, LOYALTYPOINTSTYPE.COMPAIGNREWARD, campaign.title, campaign._id, function (err) {
                        if (err) {
                            res.respond({code: 1001, message: '提交答案失败'});
                            return;
                        }

                        CampaignService.record_reward(user._id, campaign_id, function (err) {
                            if (err) {
                                res.respond({code: 1001, message: '提交答案失败'});
                                return;
                            }

                            res.respond({
                                code: 1000,
                                points_added: points_added,
                                right_answered_questions_count: right_answered_questions_count
                            });
                        })
                    })
                } else{
                    CampaignService.record_reward(user._id, campaign_id, function (err) {
                        if (err) {
                            res.respond({code: 1001, message: '提交答案失败'});
                            return;
                        }

                        res.respond({
                            code: 1000,
                            points_added: points_added,
                            right_answered_questions_count: right_answered_questions_count
                        });
                    })
                }
            })
        })
    })
};

exports.query_quiz_question = function(req, res, next){
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
    var user = req.user;
    var campaign_id = req.data._id;
    var answers = req.data.answers;

    CampaignService.canPlay(user._id, campaign_id, function(err, code){
        if(err){
            res.respond({code: code || 1001, message: err});
            return;
        }

        CampaignService.submit_quiz_answer(user._id, campaign_id, answers, function(err){
            if(err){
                res.respond({code:1001, message:err});
                return;
            }

            CampaignService.record_reward(user._id, campaign_id, function (err) {
                if (err) {
                    res.respond({code: 1001, message: '提交答案失败'});
                    return;
                }

                res.respond({code:1000});
            })
        })
    })
};

exports.query_my_quiz_answer = function(req, res, next){
    //TODO: query quiz answer
    var user = req.user;
    var campaign_id = req.data._id;

    CampaignService.query_my_quiz_answer(user._id, campaign_id, function(err, myAnswer){
        if(err){
            res.respond({code:1001, message:err});
            return;
        }

        var result = {};
        if(myAnswer){
            myAnswer.answer.forEach(function(answer){
                result[answer.order_key] = {};
                answer.choices.forEach(function(choice){
                    result[answer.order_key][choice] = true;
                })
            })
        }

        res.respond({code:1000, answers:result, result:myAnswer?myAnswer.result : null});
    })
};

exports.get_app_share_info = function(req, res, next){
    var url = req.data.url;
    CampaignService.findByUrl(url, function(err, campaign) {
        if (err) {
            res.respond({code: 1001, message: err});
            return;
        }

        if (!campaign) {
            res.respond({code: 1001, message: '未找到该活动'});
            return;
        }

        var prevurl = getPrevUrl(req);
        var previmg = getprevImg(req);
        var imgtype = '.jpg';
        if(campaign.url){
            campaign.url = prevurl + campaign.url;
        }
        if(campaign.share_image){
            campaign.share_image = previmg + campaign.share_image + imgtype;
        }
        res.respond({
            code: 1000,
            share_button: campaign.shareable && campaign.share_button,
            share_title: campaign.share_title,
            share_url: campaign.url,
            share_abstract: campaign.share_abstract,
            share_image: campaign.share_image
        })
    })
};

function getprevImg(req){
    var prevurl = getPrevUrl(req);
    var previmg = prevurl + '/images/original/';
    return previmg;
}

function getPrevUrl(req){
    var urlObject = URL.parse(req.protocol + '://' + req.get('host'));
    var port = urlObject.port;
    if(port == '80' || port == '443'){
        port = undefined;
    }

    var hosturl = getHostUrl(req);
    var protocol = req.protocol + '://';
    var prevurl = protocol + hosturl + (port ? ':' + port : '');
    return prevurl;
}

function getHostUrl(req){
    var hosturl = req.hostname;
    if (hosturl) {
        hosturl = tools.getXXNRHost(hosturl);
    } else {
        hosturl = 'www.xinxinnongren.com';
    }
    return hosturl;
}