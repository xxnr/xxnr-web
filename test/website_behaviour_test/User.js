/**
 * Created by pepelu on 2016/6/1.
 */
var utils = require('./utils');
require('should-http');
var should = require('should');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var services = require('../../services');
var UserModel = models.user;
var UserService = services.user;
var test_data = require('./test_data');
var config = require('../../config');

describe('User', function(){
    var test_user = test_data.test_user;
    var backend_admin = test_data.backend_admin;
    var test_user_token;
    var backend_admin_token;
    before('create backend admin and login', function(done){
        utils.create_backend_account(backend_admin.account, backend_admin.password, backend_admin.role, function(){
            utils.backendLogin(backend_admin.account, backend_admin.password, function(err, token){
                should.not.exist(err);
                backend_admin_token = token;
                done();
            })
        })
    });

    after('delete backend admin', function(done){
        utils.delete_backend_account(backend_admin.account, done);
    });

    beforeEach('register and login', function(done){
        UserModel.findOne({account:test_user.account}).remove(function(err) {
            should.not.exist(err);
            UserService.create({account: test_user.account, password: test_user.password}, function (err, user) {
                should.not.exist(err);
                utils.frontendLogin(test_user.account, test_user.password, function(err, token, user) {
                    should.not.exist(err);
                    user.should.have.properties('userid', 'sex', 'isUserInfoFullFilled', 'loginName', 'phone');
                    user.should.containDeep({
                        sex: false,
                        isUserInfoFullFilled: false,
                        loginName: test_user.account,
                        phone: test_user.account
                    });

                    test_user_token = token;
                    done();
                });
            });
        });
    });

    afterEach('remove test user', function(done){
        UserModel.findOne({account:test_user.account}).remove(function(err) {
            should.not.exist(err);
            done();
        });
    });

    describe('new user', function(){
        it('register', function(done) {
            get_user_info(test_user_token, function(user){
                user.should.have.properties('userid');
                user.should.not.have.properties('name', 'nickname', 'photo', 'dateinvited', 'address');
                user.should.containDeep({
                    sex: false,
                    isUserInfoFullFilled: false,
                    loginName: test_user.account,
                    phone: test_user.account,
                    isVerified: false,
                    isXXNRAgent: false,
                    isRSC: false,
                    RSCInfoVerifing: false,
                    userType: config.default_user_type,
                    userTypeInName: '普通用户',
                    verifiedTypes: [],
                    verifiedTypesInJson: []
                });
                //TODO: get user list in backend, should contain this user
                done();
            })
        });

        // TODO: need import address
        //it('full fill user info', function(done){
        //    request(app)
        //        .post('/api/v2.0/user/modify')
        //        .send()
        //});
    });

    describe('verification', function(){
        it('verify as XXNR agent', function(done){
            request_user_type('6', test_user_token, function(){
                get_user_info(test_user_token, function(user){
                    user.should.have.properties({
                        userType:'6',
                        userTypeInName:'新农经纪人',
                        verifiedTypes:[],
                        verifiedTypesInJson:[],
                        isXXNRAgent:false,
                        isVerified:false
                    });
                    verify_user_type(user.userid, ['6'], backend_admin_token, function(){
                        get_user_info(test_user_token, function(user){
                            user.should.have.properties({
                                userType:'6',
                                userTypeInName:'新农经纪人',
                                verifiedTypes:['6'],
                                verifiedTypesInJson:[{typeId:'6', typeName:'新农经纪人'}],
                                isXXNRAgent:true,
                                isVerified:true
                            });
                            //TODO: get XXNR agent list in backend, should contain this user
                            done();
                        });
                    })
                })
            })
        });

        it('verify as RSC', function(done){
            request_user_type('5', test_user_token, function(){
                // fill RSC info
                // TODO: fill company address info
                request(app)
                    .post('/api/v2.2/RSC/info/fill')
                    .send(test_user.RSCInfo)
                    .send({token:test_user_token})
                    .end(function(err, res){
                        should.not.exist(err);
                        res.body.should.have.property('code', 1000);
                        get_user_info(test_user_token, function(user){
                            user.should.have.properties({
                                userType:'5',
                                userTypeInName:'县级经销商',
                                verifiedTypes:[],
                                verifiedTypesInJson:[],
                                RSCInfoVerifing: true,
                                RSCInfo:test_user.RSCInfo,
                                isVerified:false,
                                isRSC:false
                            });
                            verify_user_type(user.userid, ['5'], backend_admin_token, function(){
                                get_user_info(test_user_token, function(user){
                                    user.should.have.properties({
                                        userType:'5',
                                        userTypeInName:'县级经销商',
                                        verifiedTypes:['5'],
                                        verifiedTypesInJson:[{typeId:'5', typeName:'县级经销商'}],
                                        RSCInfoVerifing: false,
                                        RSCInfo:test_user.RSCInfo,
                                        isVerified:true,
                                        isRSC:true
                                    });
                                    //TODO: get RSC list in backend, should contain this RSC
                                    done();
                                })
                            })
                        })
                    })
            })
        })
    })
});

function verify_user_type(userId, types, token, callback) {
    request(app)
        .put(config.manager_url + '/api/users')
        .send({id: userId, typeVerified: types, token: token})
        .end(function (err, res) {
            should.not.exist(err);
            res.body.should.have.property('code', 1000);
            callback();
        })
}

function get_user_info(token, callback) {
    request(app)
        .get('/api/v2.0/user/get')
        .query({token: token})
        .end(function (err, res) {
            should.not.exist(err);
            res.body.should.have.properties('code', 'datas');
            res.body.code.should.equal('1000');
            callback(res.body.datas);
        });
}

function request_user_type(type, token, callback){
    request(app)
        .post('/api/v2.0/user/modify')
        .send({type:type, token:token})
        .end(function(err, res){
            should.not.exist(err);
            res.body.should.have.property('code','1000');
            callback();
        })
}