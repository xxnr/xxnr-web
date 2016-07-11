/**
 * Created by pepelu on 2016/7/5.
 */
var should = require('should');
var Components = require('./utilities/components');
var test_data = require('./test_data');
var Routing = require('./Routing');
require('../../common/utils');

const default_campaign_url_name = 'testcampaign';
const default_campaign_share_url_name = 'testcampaignshare';
const campaign_type_name = {1:'品牌宣传', 2:'答题活动', 3:'竞猜活动'};
const campaign_status_message = {1:'活动尚未上线', 2:'活动还未开始', 3:'活动正在进行', 4:'活动已经结束', 5:'活动已经下线'};
var test_campaign = {
    propagate:{
        type: 1,
        title: '测试品牌宣传标题',
        online_time: new Date().add('h', -2),
        start_time: new Date().add('h', -1),
        campaign_url_name: default_campaign_url_name,
        comment: '测试备注1',
        shareable: false,
        share_button: false,
        share_title: '分享活动标题1',
        share_url_name: default_campaign_share_url_name,
        share_abstract: 'testshareabstract1',
        reward_times:1
    },
    QA: {
        type: 2,
        title: '测试答题标题',
        online_time: new Date().add('h', -2),
        start_time: new Date().add('h', -1),
        campaign_url_name: default_campaign_url_name,
        comment: '测试备注2',
        shareable: true,
        share_button: true,
        share_title: '分享活动标题2',
        share_url_name: default_campaign_share_url_name,
        share_abstract: 'testshareabstract2',
        reward_times:1,
        detail: [
            {
                order_key: 1,
                question: '测试问题1',
                type: 1,
                options: [
                    {order_key: 1, value: '选项1'},
                    {order_key: 2, value: '选项2', is_right_answer: true},
                    {order_key: 3, value: '选项3'},
                    {order_key: 4, value: '选项4', is_right_answer: true}
                ],
                points: 10
            },
            {
                order_key: 2,
                question: '测试问题2',
                type: 1,
                options: [
                    {order_key: 1, value: '选项1'},
                    {order_key: 2, value: '选项2'},
                    {order_key: 3, value: '选项3', is_right_answer: true}
                ],
                points: 20
            }]
    },
    quiz: {
        type: 3,
        title: '测试竞猜标题',
        online_time: new Date().add('h', -2),
        start_time: new Date().add('h', -1),
        campaign_url_name: default_campaign_url_name,
        comment: '测试备注3',
        shareable: true,
        share_button: true,
        share_title: '分享活动标题3',
        share_url_name: default_campaign_share_url_name,
        share_abstract: 'testshareabstract3',
        reward_times:1,
        detail: [
            {
                order_key:1,
                question: '测试问题1',
                type: 1,
                options: [
                    {order_key: 1, value: '选项1'},
                    {order_key: 2, value: '选项2'},
                    {order_key: 3, value: '选项3'},
                    {order_key: 4, value: '选项4'}
                ],
                points: 10
            },
            {
                order_key:2,
                Q: '测试问题2',
                type: 1,
                options: [
                    {order_key: 1, value: '选项1'},
                    {order_key: 2, value: '选项2'},
                    {order_key: 3, value: '选项3'}
                ],
                points: 20
            }]
    }
};
describe('campaign', function(){
    var backend_admin = test_data.backend_admin;
    var test_user = test_data.random_test_user('1000');
    var backend_admin_token, test_user_token;
    var campaign_image_url, campaign_share_image_url;
    var campaign_url = function(url_name){return '/campaigns/propagate/' + url_name;};
    before('create backend admin and login', function (done) {
        Routing.User.create_backend_account(backend_admin.account, backend_admin.password, backend_admin.role, function () {
            Routing.User.backendLogin(backend_admin.account, backend_admin.password, function (err, token) {
                should.not.exist(err);
                backend_admin_token = token;
                done();
            })
        })
    });
    before('register account and login', function (done) {
        Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
            Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                body.should.have.property('code', 1000);
                test_user_token = body.token;
                done();
            });
        });
    });
    before('prepare campaign banner image', function(done){
        Routing.backend_upload_photo(backend_admin_token, __dirname+'/test.jpg', function(body){
            body.should.have.a.lengthOf(1);
            var regex = /(.+)\..+/;
            body[0].should.match(regex);
            campaign_image_url = regex.exec(body[0])[1];
            done();
        })
    });
    before('prepare campaign share image', function(done){
        Routing.backend_upload_photo(backend_admin_token, __dirname+'/test.jpg', function(body){
            body.should.have.a.lengthOf(1);
            var regex = /(.+)\..+/;
            body[0].should.match(regex);
            campaign_share_image_url = regex.exec(body[0])[1];
            done();
        })
    });
    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });
    after('remove test user', function (done) {
        Routing.User.delete_frontend_account(test_user.account, done);
    });
    describe('framework', function(){
        describe('apis', function(){
            it('create campaign api');
            it('modify campaign api');
            it('frontend query campaign api');
            it('get campaign page api');
            it('check campaign status api');
            it('backend query campaign api');
            it('offline campaign api');
        });
        describe('create new campaign', function(){
            var propagate_campaign_path = '../views/campaigns/propagate/' + default_campaign_url_name + '.ejs';
            var QA_campaign_path = '../views/campaigns/QA/' + default_campaign_url_name + '.ejs';
            var quiz_campaign_path = '../views/campaigns/quiz/' + default_campaign_url_name + '.ejs';
            before('prepare default campaign page', function(done){
                fs.read('./data/'+default_campaign_url_name + '.ejs', function(err, content){
                    shoule.not.exist(err);
                    Components.save_file(content, propagate_campaign_path, function(){
                        Components.save_file(content, QA_campaign_path, function(){
                            Components.save_file(content, quiz_campaign_path, done);
                        })
                    })
                });
            });
            after('delete all campaign pages', function(done){
                Components.remove_file(propagate_campaign_path, function(){
                    Components.remove_file(QA_campaign_path, function(){
                        Components.remove_file(quiz_campaign_path, done);
                    })
                })
            });
            afterEach('delete all campaigns', function(done){
                Routing.Campaign.delete_all_campaigns(done);
            });
            it('propagate campaign', function(done) {
                var campaign = test_campaign.propagate;
                var expected_backend_campaign_list = {
                    code:1000,
                    campaigns:[{
                        type: campaign.type,
                        typeName:campaign_type_name[campaign.type],
                        title: campaign.title,
                        campaign_url_name: campaign.campaign_url_name,
                        comment: campaign.comment,
                        shareable: campaign.shareable,
                        share_button: campaign.share_button,
                        share_title: campaign.share_title,
                        share_url_name: campaign.share_url_name,
                        share_abstract: campaign.share_abstract
                    }]
                };
                var expected_frontend_campaign_list = {
                    code:1000,
                    campaigns:[{
                        title: campaign.title,
                        campaign_url: campaign_url(campaign.campaign_url_name),
                        comment: campaign.comment,
                        share_button: campaign.share_button,
                        share_title: campaign.share_title,
                        share_url_name: campaign_url(campaign.share_url_name),
                        share_abstract: campaign.share_abstract
                    }]
                };

                Routing.Campaign.create_campaign(backend_admin_token, campaign.type, campaign.title, campaign.online_time, null, campaign.start_time, null, campaign.campaign_url_name, campaign.comment, campaign_image_url, campaign.shareable, campaign.share_button, campaign.share_title, campaign.share_url_name, campaign.share_abstract, campaign_share_image_url, campaign.reward_times, null, function (body) {
                    body.should.have.property('code', 1000);
                    Routing.Campaign.backend_query_campaign(backend_admin_token, function (body) {
                        body.should.containDeep(expected_backend_campaign_list);
                        Routing.Campaign.frontend_query_campaign(function (body) {
                            body.should.containDeep(expected_frontend_campaign_list);
                            var campaign_page_url = body.campaigns[0].campaign_url;
                            var campaign_share_url = body.campaigns[0].share_url;
                            Routing.Campaign.get_page(campaign_page_url, function () {
                                Routing.Campaign.get_page(campaign_share_url, function () {
                                    done();
                                })
                            })
                        })
                    })
                })
            });// create propagate campaign -> query backend, got exact campaign with right property -> query frontend, verify property -> get campaign page, verify property
            it('Q/A campaign', function(done){
                var campaign = test_campaign.QA;
                var expected_backend_campaign_list = {
                    code:1000,
                    campaigns:[{
                        type: campaign.type,
                        typeName:campaign_type_name[campaign.type],
                        title: campaign.title,
                        campaign_url_name: campaign.campaign_url_name,
                        comment: campaign.comment,
                        shareable: campaign.shareable,
                        share_button: campaign.share_button,
                        share_title: campaign.share_title,
                        share_url_name: campaign.share_url_name,
                        share_abstract: campaign.share_abstract
                    }]
                };
                var expected_frontend_campaign_list = {
                    code:1000,
                    campaigns:[{
                        title: campaign.title,
                        campaign_url: campaign_url(campaign.campaign_url_name),
                        comment: campaign.comment,
                        share_button: campaign.share_button,
                        share_title: campaign.share_title,
                        share_url_name: campaign_url(campaign.share_url_name),
                        share_abstract: campaign.share_abstract
                    }]
                };
                var expected_QA_list = {
                    code:1000,
                    QA:campaign.detail
                };

                Routing.Campaign.create_campaign(backend_admin_token, campaign.type, campaign.title, campaign.online_time, null, campaign.start_time, null, campaign.campaign_url_name, campaign.comment, campaign_image_url, campaign.shareable, campaign.share_button, campaign.share_title, campaign.share_url_name, campaign.share_abstract, campaign_share_image_url, campaign.reward_times, campaign.detail, function(body){
                    body.should.have.property('code', 1000);
                    Routing.Campaign.backend_query_campaign(backend_admin_token, function(body){
                        body.should.containDeep(expected_backend_campaign_list);
                        Routing.Campaign.frontend_query_campaign(function(body){
                            body.should.containDeep(expected_frontend_campaign_list);
                            var campaign_id = body.campaigns[0]._id;
                            var campaign_page_url = body.campaigns[0].campaign_url;
                            var campaign_share_url = body.campaigns[0].share_url;
                            Routing.Campaign.get_page(campaign_page_url, function(){
                                Routing.Campaign.get_page(campaign_share_url, function(){
                                    Routing.Campaign.query_QA(campaign_id, function(body){
                                        body.should.containDeep(expected_QA_list);
                                        done();
                                    });
                                })
                            })
                        })
                    })
                })
            });// create Q/A campaign with Q/A -> query backend, got exact campaign with right property -> query frontend, verify property -> get campaign page, verify property -> query Q/A, verify
            it('quiz campaign',function(done){
                var campaign = test_campaign.quiz;
                var expected_backend_campaign_list = {
                    code:1000,
                    campaigns:[{
                        type: campaign.type,
                        typeName:campaign_type_name[campaign.type],
                        title: campaign.title,
                        campaign_url_name: campaign.campaign_url_name,
                        comment: campaign.comment,
                        shareable: campaign.shareable,
                        share_button: campaign.share_button,
                        share_title: campaign.share_title,
                        share_url_name: campaign.share_url_name,
                        share_abstract: campaign.share_abstract
                    }]
                };
                var expected_frontend_campaign_list = {
                    code:1000,
                    campaigns:[{
                        title: campaign.title,
                        campaign_url: campaign_url(campaign.campaign_url_name),
                        comment: campaign.comment,
                        share_button: campaign.share_button,
                        share_title: campaign.share_title,
                        share_url_name: campaign_url(campaign.share_url_name),
                        share_abstract: campaign.share_abstract
                    }]
                };
                var expected_question_list = {
                    code:1000,
                    questions:campaign.detail
                };

                Routing.Campaign.create_campaign(backend_admin_token, campaign.type, campaign.title, campaign.online_time, null, campaign.start_time, null, campaign.campaign_url_name, campaign.comment, campaign_image_url, campaign.shareable, campaign.share_button, campaign.share_title, campaign.share_url_name, campaign.share_abstract, campaign_share_image_url, campaign.reward_times, campaign.detail, function(body){
                    body.should.have.property('code', 1000);
                    Routing.Campaign.backend_query_campaign(backend_admin_token, function(body){
                        body.should.containDeep(expected_backend_campaign_list);
                        Routing.Campaign.frontend_query_campaign(function(body){
                            body.should.containDeep(expected_frontend_campaign_list);
                            var campaign_id = body.campaigns[0]._id;
                            var campaign_page_url = body.campaigns[0].campaign_url;
                            var campaign_share_url = body.campaigns[0].share_url;
                            Routing.Campaign.get_page(campaign_page_url, function(){
                                Routing.Campaign.get_page(campaign_share_url, function(){
                                    Routing.Campaign.query_quiz_question(campaign_id, function(body){
                                        body.should.containDeep(expected_question_list);
                                        done();
                                    });
                                })
                            })
                        })
                    })
                })
            });// create quiz campaign with questions -> query backend, got exact campaign with right property -> query frontend, verify property -> get campaign page, verify property -> query questions, verify
        });
        describe('modify campaign', function(){
            it('propagate campaign');// create propagate campaign -> modify all basic info and query
        });
        describe('online/offline and query', function(){
            var campaign_A, campaign_B, campaign_C, campaign_D, campaign_E;
            before('create campaign A, w/ #datetime now# < online time < start time < end time < offline time',function(){});
            before('create campaign B, w/ online time < #datetime now# < start time < end time < offline time',function(){});
            before('create campaign C, w/ online time < start time < #datetime now# < end time < offline time',function(){});
            before('create campaign D, w/ online time < start time < end time < #datetime now# < offline time',function(){});
            before('create campaign E, w/ online time < start time < end time < offline time < #datetime now# ',function(){});
            after('delete all campaigns', function(done){
                Routing.Campaign.delete_all_campaigns(done);
            });
            it('backend query campaign -> got A, B, C, D, E w/ right order', function(done){
                var expected_backend_campaign_list = {
                    code:1000,
                    campaigns:[
                        {
                            _id:campaign_A._id
                        },
                        {
                            _id:campaign_B._id
                        },
                        {
                            _id:campaign_C._id
                        },
                        {
                            _id:campaign_D._id
                        },
                        {
                            _id:campaign_E._id
                        }
                    ]
                };
                Routing.Campaign.backend_query_campaign(backend_admin_token, function(body){
                    body.should.containDeepOrdered(expected_backend_campaign_list);
                    body.campaigns.should.have.length(expected_backend_campaign_list.campaigns.length);
                    done();
                })
            });
            it('frontend query campaign -> got B, C, D in order', function(done){
                var expected_frontend_campaign_list = {
                    code:1000,
                    campaigns:[
                        {
                            _id:campaign_B._id
                        },
                        {
                            _id:campaign_C._id
                        },
                        {
                            _id:campaign_D._id
                        }
                    ]
                };
                Routing.Campaign.frontend_query_campaign(function(body){
                    body.should.containDeepOrdered(expected_frontend_campaign_list);
                    body.campaigns.should.have.length(expected_frontend_campaign_list.campaigns.length);
                    done();
                })
            });
            it('check campaign A status -> got not online', function(done){
                var expected_campaign_A_status = {
                    code:1000,
                    status:1,
                    message:campaign_status_message[1]
                };
                Routing.Campaign.check_campaign_status(null, campaign_A._id, function(body){
                    body.should.have.property(expected_campaign_A_status);
                    done();
                })
            });
            it('check campaign B status -> got not started', function(done){
                var expected_campaign_B_status = {
                    code:1000,
                    status:2,
                    message:campaign_status_message[2]
                };
                Routing.Campaign.check_campaign_status(null, campaign_B._id, function(body){
                    body.should.have.property(expected_campaign_B_status);
                    done();
                })
            });
            it('check campaign C status -> got started', function(done){
                var expected_campaign_C_status = {
                    code:1000,
                    status:3,
                    message:campaign_status_message[3]
                };
                Routing.Campaign.check_campaign_status(null, campaign_C._id, function(body){
                    body.should.have.property(expected_campaign_C_status);
                    done();
                })
            });
            it('check campaign D status -> got already ended', function(done){
                var expected_campaign_D_status = {
                    code:1000,
                    status:4,
                    message:campaign_status_message[4]
                };
                Routing.Campaign.check_campaign_status(null, campaign_D._id, function(body){
                    body.should.have.property(expected_campaign_D_status);
                    done();
                })
            });
            it('check campaign E status -> got already offline', function(done){
                var expected_campaign_E_status = {
                    code:1000,
                    status:5,
                    message:campaign_status_message[5]
                };
                Routing.Campaign.check_campaign_status(null, campaign_E._id, function(body){
                    body.should.have.property(expected_campaign_E_status);
                    done();
                })
            });
            describe('offline campaign api', function(){
                it('offline campaign A, fail -> check campaign A status -> got not online', function(done){
                    var expected_campaign_A_status = {
                        code:1000,
                        status:1,
                        message:campaign_status_message[1]
                    };
                    Routing.Campaign.offline_campaign(backend_admin_token, campaign_A._id, function(body){
                        body.should.have.property('code', 1001);
                        Routing.Campaign.check_campaign_status(null, campaign_A._id, function(body){
                            body.should.have.property(expected_campaign_A_status);
                            done();
                        })
                    })
                });
                it('offline campaign B -> check campaign B status -> got already offline', function(done){
                    var expected_campaign_B_status = {
                        code:1000,
                        status:5,
                        message:campaign_status_message[5]
                    };
                    Routing.Campaign.offline_campaign(backend_admin_token, campaign_B._id, function(body){
                        body.should.have.property('code', 1000);
                        Routing.Campaign.check_campaign_status(null, campaign_B._id, function(body){
                            body.should.have.property(expected_campaign_B_status);
                            done();
                        })
                    })
                });
                it('offline campaign C -> check campaign C status -> got already offline', function(done){
                    var expected_campaign_C_status = {
                        code:1000,
                        status:5,
                        message:campaign_status_message[5]
                    };
                    Routing.Campaign.offline_campaign(backend_admin_token, campaign_C._id, function(body){
                        body.should.have.property('code', 1000);
                        Routing.Campaign.check_campaign_status(null, campaign_C._id, function(body){
                            body.should.have.property(expected_campaign_C_status);
                            done();
                        })
                    })
                });
                it('offline campaign D -> check campaign D status -> got already offline', function(done){
                    var expected_campaign_D_status = {
                        code:1000,
                        status:5,
                        message:campaign_status_message[5]
                    };
                    Routing.Campaign.offline_campaign(backend_admin_token, campaign_D._id, function(body){
                        body.should.have.property('code', 1000);
                        Routing.Campaign.check_campaign_status(null, campaign_D._id, function(body){
                            body.should.have.property(expected_campaign_D_status);
                            done();
                        })
                    })
                });
                it('offline campaign E, fail -> check campaign E status -> got already offline', function(done){
                    var expected_campaign_E_status = {
                        code:1000,
                        status:5,
                        message:campaign_status_message[5]
                    };
                    Routing.Campaign.offline_campaign(backend_admin_token, campaign_E._id, function(body){
                        body.should.have.property('code', 1001);
                        Routing.Campaign.check_campaign_status(null, campaign_E._id, function(body){
                            body.should.have.property(expected_campaign_E_status);
                            done();
                        })
                    })
                });
            })
        });
        describe('reward times and query', function(){
            var campaign = test_campaign.QA;
            var campaign_A;
            before('create Q/A campaign A, w/ reward times 1', function(done){
                Routing.Campaign.create_campaign(backend_admin_token, campaign.type, campaign.title, campaign.online_time, null, campaign.start_time, null, campaign.campaign_url_name, campaign.comment, campaign_image_url, campaign.shareable, campaign.share_button, campaign.share_title, campaign.share_url_name, campaign.share_abstract, campaign_share_image_url, 1, campaign.detail, function(body) {
                    body.should.have.property('code', 1000);
                    campaign_A = body.campaign;
                    done();
                });
            });
            after('delete all campaigns', function(done){
                Routing.Campaign.delete_all_campaigns(done);
            });
            it('require reward multiple times', function(done){
                var expected_status_before_require_reward = {
                    code:1000,
                    status:3,
                    message:campaign_status_message[3],
                    times_left:1
                };
                var expected_status_after_require_reward = {
                    code:1000,
                    status:3,
                    message:campaign_status_message[3],
                    times_left:0
                };
                var expected_points_added = 0;
                var expected_require_reward_2nd_time = {
                    code:1020
                };
                var answers = [];
                campaign.detail.forEach(function(question){
                    var answer = {order_key:question.order_key, choices:[]};
                    question.options.forEach(function(option){
                        if(option.is_right_answer){
                            answer.choices.push(option.order_key);
                        }
                    });

                    expected_points_added += question.points;
                    answers.push(answer);
                });

                // check campaign status, got times left = 1
                Routing.Campaign.check_campaign_status(test_user_token, campaign_A._id, function(body){
                    body.should.containDeep(expected_status_before_require_reward);
                    // check user points
                    Routing.User.get_user_info(test_user_token, function(body) {
                        body.datas.should.have.property('pointLaterTrade');
                        var points_before = body.datas.pointLaterTrade;
                        // require reward, got 1000
                        Routing.Campaign.QA_require_reward(test_user_token, campaign_A._id, answers, function (body) {
                            body.should.have.property('code', 1000);
                            // check campaign status, got times left = 0
                            Routing.Campaign.check_campaign_status(test_user_token, campaign_A._id, function (body) {
                                body.should.containDeep(expected_status_after_require_reward);
                                // check user points, got expect points added
                                Routing.User.get_user_info(test_user_token, function(body) {
                                    body.datas.should.have.property('pointLaterTrade');
                                    var points_after = body.datas.pointLaterTrade;
                                    should.equal(points_after - points_before, expected_points_added);
                                    // require reward, got 1020(times up)
                                    Routing.Campaign.QA_require_reward(test_user_token, campaign_A._id, answers, function (body) {
                                        body.should.have.properties(expected_require_reward_2nd_time);
                                        // check user points, got not added
                                        Routing.User.get_user_info(test_user_token, function(body) {
                                            body.datas.should.have.property('pointLaterTrade');
                                            var points = body.datas.pointLaterTrade;
                                            should.equal(points - points_after, 0);
                                            done();
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            });
        });
    });
    describe('campaign type', function(){
        describe('Q/A campaign', function(){
            var campaign = test_campaign.QA;
            var campaign_A;
            beforeEach('create Q/A campaign', function(done){
                Routing.Campaign.create_campaign(backend_admin_token, campaign.type, campaign.title, campaign.online_time, null, campaign.start_time, null, campaign.campaign_url_name, campaign.comment, campaign_image_url, campaign.shareable, campaign.share_button, campaign.share_title, campaign.share_url_name, campaign.share_abstract, campaign_share_image_url, campaign.reward_times, campaign.detail, function(body) {
                    body.should.have.property('code', 1000);
                    campaign_A = body.campaign;
                    done();
                });
            });
            afterEach('delete all campaigns', function(done){
                Routing.Campaign.delete_all_campaigns(done);
            });
            describe('apis', function(){
                it('query Q/A api');
                it('require reward api');
                it('backend modify QA api');
            });

            it('modify Q/A campaign', function(done) {
                var new_QA = [
                    {
                        order_key: 1,
                        question: '测试问题1',
                        type: 1,
                        options: [
                            {order_key: 1, value: '选项1'},
                            {order_key: 2, value: '选项2'},
                            {order_key: 3, value: '选项3'},
                            {order_key: 4, value: '选项4', is_right_answer: true}
                        ],
                        points: 10
                    },
                    {
                        order_key: 2,
                        question: '测试问题2',
                        type: 1,
                        options: [
                            {order_key: 1, value: '选项1', is_right_answer: true},
                            {order_key: 2, value: '选项2'},
                            {order_key: 3, value: '选项3'}
                        ],
                        points: 20
                    },
                    {
                        order_key: 3,
                        question: '测试问题3',
                        type: 1,
                        options: [
                            {order_key: 1, value: '选项1', is_right_answer: true},
                            {order_key: 2, value: '选项2'},
                            {order_key: 3, value: '选项3'}
                        ],
                        points: 20
                    }];
                var expected_QA_list = {
                    code: 1000,
                    QA: new_QA
                };
                // modify start time to 1 hour later
                Routing.Campaign.modify_campaign(backend_admin_token, campaign_A._id, null, null, null, null, new Date().add('h', 1), null, null, null, null, null, null, null, null, null, null, null, null, function (body) {
                    body.should.have.property('code', 1000);
                    // modify QA, got success
                    Routing.Campaign.backend_modify_QA(backend_admin_token, campaign_A._id, new_QA, function (body) {
                        body.should.have.property('code', 1000);
                        // query QA, got modified
                        Routing.Campaign.query_QA(campaign_A._id, function (body) {
                            body.should.have.properties(expected_QA_list);
                            // modify start time to now
                            Routing.Campaign.modify_campaign(backend_admin_token, campaign_A._id, null, null, null, null, new Date(), null, null, null, null, null, null, null, null, null, null, null, null, function (body) {
                                body.should.have.property('code', 1000);
                                // modify QA, got failed
                                Routing.Campaign.backend_modify_QA(backend_admin_token, campaign_A._id, [{
                                    order_key: 1,
                                    question: '测试问题3',
                                    type: 1,
                                    options: [
                                        {order_key: 1, value: '选项1'},
                                        {order_key: 2, value: '选项2', is_right_answer: true},
                                        {order_key: 3, value: '选项3'}
                                    ],
                                    points: 40
                                }], function (body) {
                                    body.should.have.property('code', 1001);
                                    // query QA, got modified
                                    Routing.Campaign.query_QA(campaign_A._id, function (body) {
                                        body.should.have.properties(expected_QA_list);
                                    })
                                })
                            })
                        })
                    })
                })
            });
            it('play Q/A campaign', function(done){
                Routing.User.get_user_info(test_user_token, function(body) {
                    body.datas.should.have.property('pointLaterTrade');
                    var points_before = body.datas.pointLaterTrade;
                    Routing.Campaign.frontend_query_campaign(function(body) {
                        body.should.have.property('code', 1000);
                        var campaign_id = body.campaigns[0]._id;
                        var answers = [{order_key: 1, choices: [1, 3]}, {order_key: 2, choices: [2]}];
                        // require reward with answers, got result
                        Routing.Campaign.QA_require_reward(test_user_token, campaign_id, answers, function (body) {
                            body.should.have.property('code', 1000);
                            var expected_points_added = 10;
                            // query user points, got points added
                            Routing.User.get_user_info(test_user_token, function (body) {
                                body.datas.should.have.property('pointLaterTrade');
                                var points_after = body.datas.pointLaterTrade;
                                should.equal(points_after - points_before, expected_points_added);
                                done();
                            })
                        })
                    })
                })
            });
        });
        describe('quiz campaign', function(){
            var campaign = test_campaign.quiz;
            var campaign_A;
            beforeEach('create quiz campaign', function(done){
                Routing.Campaign.create_campaign(backend_admin_token, campaign.type, campaign.title, campaign.online_time, null, campaign.start_time, null, campaign.campaign_url_name, campaign.comment, campaign_image_url, campaign.shareable, campaign.share_button, campaign.share_title, campaign.share_url_name, campaign.share_abstract, campaign_share_image_url, campaign.reward_times, campaign.detail, function(body) {
                    body.should.have.property('code', 1000);
                    campaign_A = body.campaign;
                    done();
                });
            });
            afterEach('delete all campaigns', function(done){
                Routing.Campaign.delete_all_campaigns(done);
            });
            describe('apis', function(){
                it('query questions api');
                it('backend modify quiz question api');
                it('user answer api');
                it('user quern my answer api');
                it('backend modify right answer api');
                it('backend query quiz right answer api');
                it('trigger reward job api');
                it('query result api');
            });

            it('modify quiz campaign', function(done){
                var questions = [
                    {
                        question: '测试问题',
                        type: 1,
                        options: [
                            {order_key: 1, value: '选项1'},
                            {order_key: 2, value: '选项2'},
                            {order_key: 3, value: '选项3'}
                        ],
                        points: 15
                    }
                ];
                var fail_modified_questions = [
                    {
                        question: '测试问题3',
                        type: 1,
                        options: [
                            {order_key: 1, value: '选项1'},
                            {order_key: 2, value: '选项2'}
                        ],
                        points: 5
                    }
                ];
                var answers = [{order_key: 1, choices: [1]}];
                var fail_modified_answers = [{order_key: 1, choices: [2]}];
                var expected_question_list = {
                    code:1000,
                    questions:questions
                };
                var expected_quiz_right_answers = {
                    code:1000,
                    answers:[{order_key: 1, choices: [1]}]
                };
                // modify start time to 1 hour later
                Routing.Campaign.modify_campaign(backend_admin_token, campaign_A._id, null, null, null, null, new Date().add('h', 1), null, null, null, null, null, null, null, null, null, null, null, null, function (body) {
                    body.should.have.property('code', 1000);
                    // modify question, success
                    Routing.Campaign.backend_modify_quiz_question(backend_admin_token, campaign_A._id, questions, function(body){
                        body.should.have.property('code', 1000);
                        // query QA, got expected
                        Routing.Campaign.query_quiz_question(campaign_A._id, function(body){
                            body.should.have.properties(expected_question_list);
                            // modify start time to now
                            Routing.Campaign.modify_campaign(backend_admin_token, campaign_A._id, null, null, null, null, new Date(), null, null, null, null, null, null, null, null, null, null, null, null, function (body) {
                                body.should.have.property('code', 1000);
                                // modify questions, failed
                                Routing.Campaign.backend_modify_quiz_question(backend_admin_token, campaign_A._id, fail_modified_questions, function (body) {
                                    body.should.have.property('code', 1001);
                                    // query QA, got expected
                                    Routing.Campaign.query_quiz_question(campaign_A._id, function(body) {
                                        body.should.have.properties(expected_question_list);
                                        // modify right quiz answers, success
                                        Routing.Campaign.backend_modify_quiz_right_answer(backend_admin_token, campaign_A._id, answers, function (body) {
                                            body.should.have.property('code', 1000);
                                            // query right quiz answer, got expected
                                            Routing.Campaign.backend_query_quiz_right_answer(backend_admin_token, campaign_A._id, function(body) {
                                                body.should.have.properties(expected_quiz_right_answers);
                                                // trigger reward job
                                                Routing.Campaign.trigger_quiz_reward(backend_admin_token, campaign_A._id, function (body) {
                                                    body.should.have.property('code', 1000);
                                                    // modify quiz answers, fail
                                                    Routing.Campaign.backend_modify_quiz_right_answer(backend_admin_token, campaign_A._id, fail_modified_answers, function (body) {
                                                        body.should.have.property('code', 1001);
                                                        // query right quiz answer, got expected
                                                        Routing.Campaign.backend_query_quiz_right_answer(backend_admin_token, campaign_A._id, function(body) {
                                                            body.should.have.properties(expected_quiz_right_answers);
                                                            done();
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            });
            it('query quiz result', function(done){
                var answers = [{order_key: 1, choices: [1]}, {order_key: 2, choices: [2]}];
                var expected_points_added = 30;
                var expected_quiz_result = {code:1000, right_answer: [{order_key: 1, choices: [1]}, {order_key: 2, choices: [2]}], points_added: expected_points_added};
                // answer quiz question
                Routing.Campaign.quiz_answer(test_user_token, campaign_A._id, answers, function(body) {
                    body.should.have.property('code', 1000);
                    // query quiz result before trigger reward job
                    Routing.Campaign.query_quiz_result(test_user_token, campaign_A._id, function (body) {
                        body.should.have.property('code', 1001);
                        // backend modify right answer
                        Routing.Campaign.backend_modify_quiz_right_answer(backend_admin_token, campaign_A._id, answers, function (body) {
                            body.should.have.property('code', 1000);
                            // trigger reward
                            Routing.Campaign.trigger_quiz_reward(backend_admin_token, campaign_A._id, function (body) {
                                body.should.have.property('code', 1000);
                                Routing.Campaign.query_quiz_result(test_user_token, campaign_A._id, function (body) {
                                    body.should.have.properties(expected_quiz_result);
                                    done();
                                })
                            })
                        })
                    })
                })
            });
            it('play quiz campaign', function(done){
                var answers = [{order_key: 1, choices: [1]}, {order_key: 2, choices: [2]}];
                var new_answers = [{order_key: 1, choices: [2]}, {order_key: 2, choices: [2]}];
                var answers_after_endtime = [{order_key: 1, choices: [2]}, {order_key: 2, choices: [3]}];
                var expected_points_added = 10;
                var expected_quiz_result = {code:1000, right_answer: [{order_key: 1, choices: [1]}, {order_key: 2, choices: [2]}], points_added: expected_points_added};
                Routing.User.get_user_info(test_user_token, function(body) {
                    body.datas.should.have.property('pointLaterTrade');
                    var points_before = body.datas.pointLaterTrade;
                    Routing.Campaign.frontend_query_campaign(function (body) {
                        body.should.have.property('code', 1000);
                        var campaign_id = body.campaigns[0]._id;
                        // answer quiz question
                        Routing.Campaign.quiz_answer(test_user_token, campaign_id, answers, function(body){
                            body.should.have.property('code', 1000);
                            // query my answers, got expected
                            Routing.Campaign.query_my_quiz_answer(test_user_token, campaign_id, function(body){
                                body.shold.containDeep({code:1000, answers:answers});
                                // modify quiz answers
                                Routing.Campaign.quiz_answer(test_user_token, campaign_id, new_answers, function(body) {
                                    body.should.have.property('code', 1000);
                                    // query my answers, got modified
                                    Routing.Campaign.query_my_quiz_answer(test_user_token, campaign_id, function(body) {
                                        body.shold.containDeep({code: 1000, answers: new_answers});
                                        // modify end time to now
                                        Routing.Campaign.modify_campaign(backend_admin_token, campaign_id, null, null, null, null, null, new Date(), null, null, null, null, null, null, null, null, null, null, null, function(body) {
                                            body.should.have.property('code', 1000);
                                            // modify quiz answers
                                            Routing.Campaign.quiz_answer(test_user_token, campaign_id, answers_after_endtime, function(body) {
                                                body.should.have.property('code', 1021);
                                                // query my answers, got not modified
                                                Routing.Campaign.query_my_quiz_answer(test_user_token, campaign_id, function(body) {
                                                    body.shold.containDeep({code: 1000, answers: new_answers});
                                                    // backend modify right answer
                                                    Routing.Campaign.backend_modify_quiz_right_answer(backend_admin_token, campaign_id, answers, function (body) {
                                                        body.should.have.property('code', 1000);
                                                        // trigger reward
                                                        Routing.Campaign.trigger_quiz_reward(backend_admin_token, campaign_id, function (body) {
                                                            body.should.have.property('code', 1000);
                                                            Routing.Campaign.query_quiz_result(test_user_token, campaign_id, function(body){
                                                                body.should.have.properties(expected_quiz_result);
                                                                Routing.User.get_user_info(test_user_token, function(body) {
                                                                    body.datas.should.have.property('pointLaterTrade');
                                                                    var points_after = body.datas.pointLaterTrade;
                                                                    should.equal(points_after - points_before, expected_points_added);
                                                                    done();
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            });
        });
    })
});