/**
 * Created by pepelu on 2016/6/1.
 */
var Routing = require('./Routing');
var NodeRSA = require('node-rsa');
require('should-http');
var should = require('should');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var UserModel = models.user;
var test_data = require('./test_data');
var config = require('../../config');
var deployment = require('../../deployment');
var PotentialCustomerModel = models.potential_customer;
var utils = require('../../common/utils');
var ProductModel = models.product;
var SKUModel = models.SKU;
var UserAddressModel = models.useraddress;
var Components = require('./utilities/components');
var cookieParser = require('cookie');
var vCodeModel = models.vcode;

describe('User', function() {
    var test_user = test_data.test_user;
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_address;
    var test_address_2, test_address_3, test_address_4;
    before('deploy supplier, brands, product_attributes, SKU_attributes', function(done){
        deployment.deploy_SKU(done);
    });
    before('delete users', function(done){
        UserModel.find({}).remove(done);
    });
    before('create backend admin and login', function (done) {
        Routing.User.create_backend_account(backend_admin.account, backend_admin.password, backend_admin.role, function () {
            Routing.User.backendLogin(backend_admin.account, backend_admin.password, function (err, token) {
                should.not.exist(err);
                backend_admin_token = token;
                done();
            })
        })
    });
    before('prepare test address', function(done){
        Routing.Address.get_address_by_name(test_data.test_address.province, test_data.test_address.city, test_data.test_address.county, test_data.test_address.town, function (err, address) {
            test_address = address;
            done();
        })
    });

    before('prepare test address 2 3 4', function(done){
        var address_3 = {
            province:'山西',
            city:'吕梁',
            county:'离石'
        };
        var address_4 = {
            province:'河南',
            city:'济源',
            town:'济水街道'
        };
        Routing.Address.get_address_by_name(test_data.test_address_2.province, test_data.test_address_2.city, test_data.test_address_2.county, test_data.test_address_2.town, function (err, address) {
            test_address_2 = address;
            Routing.Address.get_address_by_name(address_3.province, address_3.city, address_3.county, address_3.town, function (err, address) {
                test_address_3 = address;
                Routing.Address.get_address_by_name(address_4.province, address_4.city, address_4.county, address_4.town, function (err, address) {
                    test_address_4 = address;
                    done();
                })
            })
        })
    });
    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });
    describe('Get public key api', function () {
        Components.testGetAndPost('get public key to encrypt password')
            .call('/api/v2.0/user/getpubkey')
            .end(function (err, res) {
                res.body.should.have.property('code', 1000);
                res.body.should.have.property('public_key').match(/.+/);
            })
    });
    describe('Login api', function () {
        var public_key;
        var api = '/api/v2.0/user/login';
        before(function (done) {
            Routing.User.getPublicKey(function (err, publicKey) {
                if (err) {
                    should.not.exist(err);
                }

                public_key = publicKey;
                done();
            });
        });

        before('create test account', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(){
                done();
            })
        });

        var userLoginValidator = function (res, keepLogin) {
            res.body.should.have.property('code', '1000');
            res.body.should.have.properties('datas', 'token');
            res.body.token.should.match(/.+/);
            res.body.datas.should.have.properties('userid', 'loginName', 'phone', 'sex', 'isUserInfoFullFilled', 'isVerified', 'isXXNRAgent', 'isRSC', 'RSCInfoVerifing', 'userType', 'userTypeInName', 'verifiedTypes', 'verifiedTypesInJson', 'cartId');
            var hasUserCookie = false;
            var hasTokenCookie = false;
            var hasCartCookie = false;
            res.headers['set-cookie'].forEach(function (cookieStr) {
                var cookie = cookieParser.parse(cookieStr);
                if (cookie.__user) {
                    hasUserCookie = true;
                    cookie.should.have.property('Domain', '.xinxinnongren.com');
                    cookie.should.have.property('Path', '/');
                    if (keepLogin) {
                        cookie.should.have.property('Expires');
                        (new Date(cookie.Expires) > new Date()).should.be.true();
                    } else {
                        cookie.should.not.have.property('Expires');
                    }
                }

                if (cookie.token) {
                    hasTokenCookie = true;
                    cookie.should.have.property('Domain', '.xinxinnongren.com');
                    cookie.should.have.property('Path', '/');
                    if (keepLogin) {
                        cookie.should.have.property('Expires');
                        (new Date(cookie.Expires) > new Date()).should.be.true();
                    } else {
                        cookie.should.not.have.property('Expires');
                    }
                }

                if (cookie.__scart) {
                    hasCartCookie = true;
                    cookie.should.have.property('Domain', '.xinxinnongren.com');
                    cookie.should.have.property('Path', '/');
                    cookie.should.not.have.property('Expires');
                }
            });

            hasUserCookie.should.be.true;
            hasTokenCookie.should.be.true;
            hasCartCookie.should.be.true;
        };

        Components.testGetAndPost('user login api w/o account')
            .call(api)
            .send({password: test_data.test_user.password})
            .end(function (err, res) {
                res.body.should.have.properties({
                    'code': 1001,
                    'message': '请输入正确的手机号'
                });
            });

        Components.testGetAndPost('user login api w/o password')
            .call(api)
            .send({account: test_data.test_user.account})
            .end(function (err, res) {
                res.body.should.have.properties({
                    'code': 1001,
                    'message': '请输入密码'
                });
            });

        Components.testGetAndPost('user login api w/o keepLogin')
            .call(api)
            .send(function () {
                return {
                    account: test_data.test_user.account,
                    password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_data.test_user.password, 'base64', 'utf-8'))
                }
            })
            .end(function (err, res) {
                userLoginValidator(res, true);
            });

        Components.testGetAndPost('user login api w/ keepLogin=false')
            .call(api)
            .send(function () {
                return {
                    account: test_data.test_user.account,
                    password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_data.test_user.password, 'base64', 'utf-8')),
                    keepLogin: false
                }
            })
            .end(function (err, res) {
                userLoginValidator(res, false);
            });

        Components.testGetAndPost('user login api w/ keepLogin=true')
            .call(api)
            .send(function () {
                return {
                    account: test_data.test_user.account,
                    password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_data.test_user.password, 'base64', 'utf-8'))
                }
            })
            .end(function (err, res) {
                userLoginValidator(res, true);
            })
    });
    describe('Register api', function () {
        var api = '/api/v2.0/user/register';
        var public_key;
        before(function (done) {
            Routing.User.getPublicKey(function (err, publicKey) {
                if (err) {
                    should.not.exist(err);
                }

                public_key = publicKey;
                done();
            });
        });
        var invalidTests = [
            {
                name: 'user register api w/o account',
                params: {},
                result: {
                    code: 1001,
                    message: '请输入正确的手机号'
                }
            },
            {
                name: 'user register api w/ invalid account',
                params: {account: '111'},
                result: {
                    code: 1001,
                    message: '请输入正确的手机号'
                }
            },
            {
                name: 'user register api w/o vCode',
                params: {account: test_data.test_user.account},
                result: {
                    code: 1001,
                    message: '请输入验证码'
                }
            },
            {
                name: 'user register api w/o password',
                params: {account: test_data.test_user.account, smsCode: '123456'},
                result: {
                    code: 1001,
                    message: '请输入密码'
                }
            },
            {
                name: 'user register api w/ invalid password',
                params: function () {
                    return {
                        account: test_data.test_user.account,
                        smsCode: '123456',
                        password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt('12345', 'base64', 'utf-8'))
                    }
                },
                result: {
                    code: 1001,
                    message: '密码需不小于6位'
                }
            },
            {
                name: 'user register api w/o vCode send',
                params: function () {
                    return {
                        account: test_data.test_user.account,
                        smsCode: '123456',
                        password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt('123456', 'base64', 'utf-8'))
                    }
                },
                result: {
                    code: 1001,
                    message: '没有查找到验证码'
                }
            }];

        invalidTests.forEach(function (test) {
            Components.testGetAndPost(test.name)
                .call(api)
                .send(test.params)
                .end(function (err, res) {
                    res.body.should.have.properties(test.result)
                })
        })
    });
    describe('Reset password api', function(){
        var public_key;
        before(function (done) {
            Routing.User.getPublicKey(function (err, publicKey) {
                if (err) {
                    should.not.exist(err);
                }

                public_key = publicKey;
                done();
            });
        });
        before('register empty account', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(){
                done()
            });
        });

        var invalidTests = [{
            name:'reset password w/o account',
            params: {},
            result: {
                code: 1001,
                message: '请输入正确的手机号'
            }
        },{
            name:'reset password w/ invalid account',
            params:{account:'111'},
            result: {
                code: 1001,
                message: '请输入正确的手机号'
            }
        },{
            name:'reset password w/o vcode',
            params:{account:test_user.account},
            result: {
                code: 1001,
                message: '请输入验证码'
            }
        },{
            name:'reset password w/o new password',
            params: {account: test_data.test_user.account, smsCode: '123456'},
            result: {
                code: 1001,
                message: '请输入密码'
            }
        },{
            name:'reset password w/ invalid password',
            params: function () {
                return {
                    account: test_data.test_user.account,
                    smsCode: '123456',
                    newPwd: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt('12345', 'base64', 'utf-8'))
                }
            },
            result: {
                code: 1001,
                message: '密码需不小于6位'
            }
        },{
            name:'reset password w/o vcode send',
            params: function () {
                return {
                    account: test_data.test_user.account,
                    smsCode: '123456',
                    newPwd: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt('123456', 'base64', 'utf-8'))
                }
            },
            result: {
                code: 1001,
                message: '没有查找到验证码'
            }
        }];

        invalidTests.forEach(function (test) {
            Components.testGetAndPost(test.name)
                .call('/api/v2.0/user/resetpwd')
                .send(test.params)
                .end(function (err, res) {
                    res.body.should.have.properties(test.result)
                })
        })
    });
    describe('modify password api', function(){
        var token;
        var public_key;
        before(function (done) {
            Routing.User.getPublicKey(function (err, publicKey) {
                if (err) {
                    should.not.exist(err);
                }

                public_key = publicKey;
                done();
            });
        });
        before('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    token = body.token;
                    done();
                })
            })
        });

        var invalidTests = [{
            name:'modify password w/o old password',
            params: function(){return {token:token}},
            result:{
                code:'1001',
                'message':'请输入旧密码'
            }
        },{
            name:'modify password w/o new password',
            params:function(){return {
                token:token,
                oldPwd:'abc'
            }},
            result:{'code': '1001', 'message': '请输入新密码'}
        },{
            name:'modify password w/ invalid new password',
            params:function(){return {
                token:token,
                oldPwd:encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_user.password, 'base64', 'utf-8')),
                newPwd:encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt('12345', 'base64', 'utf-8'))
            }},
            result:{'code': '1001', 'message': '新密码长度需不小于6位'}
        },{
            name:'modify password w/ new password = old password',
            params:function(){return {
                token:token,
                oldPwd:encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_user.password, 'base64', 'utf-8')),
                newPwd:encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_user.password, 'base64', 'utf-8'))
            }},
            result:{'code': '1001', 'message': '新密码与旧密码不能一致'}
        },{
            name:'modify password w/ wrong old password',
            params:function(){return{
                token:token,
                oldPwd:encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_user.wrong_password, 'base64', 'utf-8')),
                newPwd:encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(test_user.password, 'base64', 'utf-8'))
            }},
            result:{'code': '1001', 'message': '旧密码输入错误'}
        }];
        invalidTests.forEach(function (test) {
            Components.testGetAndPost(test.name)
                .call('/api/v2.0/user/modifypwd')
                .send(test.params)
                .end(function (err, res) {
                    res.body.should.have.properties(test.result)
                })
        })
    });
    describe('Modify user info api', function(){
        var token;
        before('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    token = body.token;
                    done();
                })
            })
        });
        var invalidTests = [{
            name:'modify user info w/ long nickname(13 chars)',
            params:function(){return{
                token:token,
                nickName:'abcdefghijklm'
            }},
            result:{'code': '1001', 'message': '昵称输入过长'}
        },{
            name:'modify user info w/ invalid user type',
            params:function(){return{
                token:token,
                type:'100'
            }},
            result:{code:1001, message:'未查询到用户类型'}
        },{
            name:'modify user info w/ province id but w/o city id',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id
                }
            }},
            result:{code: 1001, message: '请选择城市'}
        },{
            name:'modify user info w/ province city id but w/o town id',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address.city.id
                }
            }},
            result:{code: 1001, message: '请选择乡镇'}
        },{
            name:'modify user info w/ invalid province id',
            params:function(){return{
                token:token,
                address:{
                    provinceId:'invalidprovinceid',
                    cityId:'invalidcityid',
                    townId:'invalidtownid'
                }
            }},
            result:{code: 1001, message: '没有查找到省'}
        },{
            name:'modify user info w/ invalid city id',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:'invalidcityid',
                    townId:'invalidtownid'
                }
            }},
            result:{code: 1001, message: '没有查找到市'}
        },{
            name:'modify user info w/ invalid county id',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address.city.id,
                    countyId:'invalidcountyid',
                    townId:'invalidtownid'
                }
            }},
            result:{code: 1001, message: '没有查找到区县'}
        },{
            name:'modify user info w/ invalid town id',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address.city.id,
                    countyId:test_address.county.id,
                    townId:'invalidtownid'
                }
            }},
            result:{code: 1001, message: '没有查找到乡镇'}
        },{
            name:'modify user info w/ invalid town id',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address.city.id,
                    townId:'invalidtownid'
                }
            }},
            result:{code: 1001, message: '没有查找到乡镇'}
        },{
            name:'modify user info w/ city not belong to province',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address_3.city.id,
                    townId:'invalidtownid'
                }
            }},
            result:{code: 1001, message: '所选城市与省份不匹配，请重新选择'}
        },{
            name:'modify user info w/ county not belong to city',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address.city.id,
                    countyId:test_address_2.county.id,
                    townId:'invalidtownid'
                }
            }},
            result:{code: 1001, message: '所选区县与城市不匹配，请重新选择'}
        },{
            name:'modify user info w/ town not belong to county',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address.city.id,
                    countyId:test_address.county.id,
                    townId:test_address_2.town.id
                }
            }},
            result:{code: 1001, message: '所选乡镇与区县不匹配，请重新选择'}
        },{
            name:'modify user info w/ town not belong to city',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address.province.id,
                    cityId:test_address.city.id,
                    townId:test_address_2.town.id
                }
            }},
            result:{code: 1001, message: '所选乡镇与城市不匹配，请重新选择'}
        },{
            name:'modify user info w/ only province city town',
            params:function(){return{
                token:token,
                address:{
                    provinceId:test_address_4.province.id,
                    cityId:test_address_4.city.id,
                    townId:test_address_4.town.id
                }
            }},
            result:{code: '1000'}
        }];

        invalidTests.forEach(function (test) {
            Components.testGetAndPost(test.name)
                .call('/api/v2.0/user/modify')
                .send(test.params)
                .end(function (err, res) {
                    res.body.should.have.properties(test.result)
                })
        })
    });
    describe('Test user account api', function(){
        var token;
        before('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    token = body.token;
                    done();
                })
            })
        });
        var testCases = [{
            name:'test user account w/ invalid account',
            params:{account:'10000000000'},
            result:{code:1001, message: '请输入正确的手机号'}
        },{
            name:'test user account w/ invalid account',
            params:{account:'17112341234'},
            result:{code:1001, message: '该手机号未注册'}
        },{
            name:'test user account w/ valid account',
            params:{account:test_user.account},
            result:{code:'1000', message: '该手机号已注册'}
        }];

        testCases.forEach(function (test) {
            Components.testGetAndPost(test.name)
                .call('/api/v2.0/user/findAccount')
                .send(test.params)
                .end(function (err, res) {
                    res.body.should.have.properties(test.result)
                })
        })
    });
    describe('Generate vcode api', function(){
        var token;
        before('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    token = body.token;
                    done();
                })
            })
        });
        before('delete vCodes', function(done){
            vCodeModel.find({}).remove(done);
        });
        after('delete vCodes', function(done){
            vCodeModel.find({}).remove(done);
        });
        var testCases = [{
            name:'generate vcode (register) w/o account',
            params:{bizcode:'register'},
            result:{code: 1001, message: '请输入正确的手机号'}
        },{
            name:'generate vcode (register) w/ invalid account',
            params:{bizcode:'register', tel:'12345'},
            result:{code: 1001, message: '请输入正确的手机号'}
        },{
            name:'generate vcode (register) w/ registered account',
            params:{bizcode:'register', tel:test_user.account},
            result:{code: 1001, message: '该手机号已注册，请重新输入'}
        },{
            name:'generate vcode (register) w/ new account',
            params:{bizcode:'register', tel:test_data.random_test_user('0001').account},
            result:{code: '1000'},
            noGet:true
        },{
            name:'generate vcode (register) w/ new account 2nd time',
            params:{bizcode:'register', tel:test_data.random_test_user('0001').account},
            result:{code: 1001, message: '获取短信验证码太频繁，请稍后再试'}
        },{
            name:'generate vcode (reset password) w/o account',
            params:{bizcode:'resetpwd'},
            result:{code: 1001, message: '请输入正确的手机号'}
        },{
            name:'generate vcode (reset password) w/ invalid account',
            params:{bizcode:'resetpwd', tel:'12345'},
            result:{code: 1001, message: '请输入正确的手机号'}
        },{
            name:'generate vcode (reset password) w/ unregistered account',
            params:{bizcode:'resetpwd', tel:test_data.random_test_user('0002').account},
            result:{code: 1001, message: '该手机号未注册，请重新输入'}
        },{
            name:'generate vcode (reset password) w/ unregistered account',
            params:{bizcode:'resetpwd', tel:test_user.account},
            result:{code: '1000'},
            noGet:true
        },{
            name:'generate vcode (reset password) w/ unregistered account 2nd time',
            params:{bizcode:'resetpwd', tel:test_user.account},
            result:{code: 1001, message: '获取短信验证码太频繁，请稍后再试'}
        }];
        testCases.forEach(function (test) {
            Components.testGetAndPost(test.name)
                .call('/api/v2.0/sms')
                .send(test.params)
                .end(function (err, res) {
                    res.body.should.have.properties(test.result)
                }, test.noGet, test.noPost)
        })
    });
    describe('Get api', function () {
        var api = '/api/v2.0/user/get';
        var token;
        before(function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    token = body.token;
                    done();
                });
            });
        });

        Components.testGetAndPost('user get api w/o login')
            .call(api)
            .end(function (err, res) {
                res.body.should.have.properties({
                    code: 1401,
                    message: '请先登录'
                })
            });

        Components.testGetAndPost('user get api w/ login')
            .token(function () {
                return token;
            })
            .call(api)
            .end(function (err, res) {
                res.body.should.containDeep({
                    code: '1000',
                    message: 'success',
                    datas: {
                        phone: test_data.test_user.account
                    }
                });
                res.body.datas.should.have.properties('userid', 'loginName', 'sex', 'pointLaterTrade', 'isUserInfoFullFilled', 'isVerified', 'isXXNRAgent', 'isRSC', 'RSCInfoVerifing', 'userType', 'userTypeInName', 'verifiedTypes', 'verifiedTypesInJson');
                res.body.datas.pointLaterTrade.should.be.type('number');
                res.body.datas.isUserInfoFullFilled.should.be.type('boolean');
                res.body.datas.isVerified.should.be.type('boolean');
                res.body.datas.isXXNRAgent.should.be.type('boolean');
                res.body.datas.isRSC.should.be.type('boolean');
                res.body.datas.RSCInfoVerifing.should.be.type('boolean');
            })
    });
    describe('User consignee address apis', function() {
        var token;
        var test_user_consignee_address_id;
        var test_consignee = test_user.user_address[0];
        before('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    token = body.token;
                    done();
                })
            })
        });
        before('add user consignee address', function (done) {
            Routing.User.add_user_address({
                provinceId: test_address.province.id,
                cityId: test_address.city.id,
                countyId: test_address.county.id,
                townId: test_address.town.id,
                detail: test_consignee.detail,
                receiptPeople: test_consignee.receiptPeople,
                receiptPhone: test_consignee.receiptPhone
            }, token, function (body) {
                body.should.have.property('code', 1000);
                test_user_consignee_address_id = body.datas.addressId;
                done();
            });
        });

        describe('Add user consignee address api', function(){
            var testCases = [{
                name:'add user address w/o detail address',
                params: function(){
                    return {token: token}
                },
                result:{code: 1001, message: '请求参数错误，无效的address参数'}
            },{
                name:'add user address w/o areaId',
                params:function(){
                    return {token: token, address:test_consignee.detail}
                },
                result:{code: 1001, message: '请求参数错误，无效的areaId参数'}
            },{
                name:'add user address w/o receiptPhone',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id}
                },
                result:{code: 1001, message: '请求参数错误，无效的receiptPhone参数'}
            },{
                name:'add user address w/ invalid receiptPhone',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:'151'}
                },
                result:{code: 1001, message: '请输入正确的手机号'}
            },{
                name:'add user address w/o receiptPeople',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone}
                },
                result:{code: 1001, message: '请求参数错误，无效的receiptPeople参数'}
            },{
                name:'add user address w/ invalid areaId',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:'wrongareaid', receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople}
                },
                result:{code: 1001, message: '数据没有查到，没有找到请求参数中的省份'}
            },{
                name:'add user address w/ invalid cityId',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:'wrongcityid'}
                },
                result:{code: 1001, message: '数据没有查到，没有找到请求参数中的城市'}
            },{
                name:'add user address w/ invalid countyId',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:'wrongcountyid'}
                },
                result:{code: 1001, message: '数据没有查到，没有找到请求参数中的县区'}
            },{
                name:'add user address w/ invalid townId',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:test_address.county.id, townId:'wrongtownid'}
                },
                result:{code: 1001, message: '数据没有查到，没有找到请求参数中的乡镇'}
            },{
                name:'add user address w/ city not belong to province',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address_3.city.id, countyId:test_address.county.id, townId:test_address.town.id}
                },
                result:{code: 1001, message: '所选城市不属于所选省份'}
            },{
                name:'add user address w/ county not belong to city',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:test_address_2.county.id, townId:test_address.town.id}
                },
                result:{code: 1001, message: '所选区县不属于所选城市'}
            },{
                name:'add user address w/ town not belong to county',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:test_address.county.id, townId:test_address_2.town.id}
                },
                result:{code: 1001, message: '所选乡镇不属于所选区县'}
            },{
                name:'add user address w/ town not belong to city',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, townId:test_address_2.town.id}
                },
                result:{code: 1001, message: '所选乡镇不属于所选城市'}
            },{
                name:'add user address w/ right province city and town',
                params:function(){
                    return {token:token, address:test_consignee.detail, areaId:test_address_4.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address_4.city.id, townId:test_address_4.town.id}
                },
                result:{code:1000}
            }
            ];

            testCases.forEach(function (test) {
                Components.testGetAndPost(test.name)
                    .call('/api/v2.0/user/saveUserAddress')
                    .send(test.params)
                    .end(function (err, res) {
                        res.body.should.have.properties(test.result)
                    })
            })
        });

        describe('Modify user consignee address api', function () {
            var testCases = [{
                name: 'modify user address w/o address id ',
                params: function () {
                    return {token: token}
                },
                result: {'code': '1001', 'message': '请求参数错误，无效的addressId参数'}
            }, {
                name: 'modify user address w/ invalid phone',
                params: function () {
                    return {token: token, addressId: test_user_consignee_address_id, receiptPhone: '123'}
                },
                result: {'code': '1001', 'message': '请输入正确的手机号'}
            },{
                name:'modify user address w/ invalid areaId',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:'wrongareaid', receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople}
                },
                result:{code: '1001', message: '数据没有查到，没有找到请求参数中的省份'}
            },{
                name:'modify user address w/ invalid cityId',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:'wrongcityid'}
                },
                result:{code: '1001', message: '数据没有查到，没有找到请求参数中的城市'}
            },{
                name:'modify user address w/ invalid countyId',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:'wrongcountyid'}
                },
                result:{code: '1001', message: '数据没有查到，没有找到请求参数中的县区'}
            },{
                name:'modify user address w/ invalid townId',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:test_address.county.id, townId:'wrongtownid'}
                },
                result:{code: '1001', message: '数据没有查到，没有找到请求参数中的乡镇'}
            },{
                name:'modify user address w/ city not belong to province',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address_3.city.id, countyId:test_address.county.id, townId:test_address.town.id}
                },
                result:{code: 1001, message: '所选城市不属于所选省份'}
            },{
                name:'modify user address w/ county not belong to city',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:test_address_2.county.id, townId:test_address.town.id}
                },
                result:{code: 1001, message: '所选区县不属于所选城市'}
            },{
                name:'modify user address w/ town not belong to county',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, countyId:test_address.county.id, townId:test_address_2.town.id}
                },
                result:{code: 1001, message: '所选乡镇不属于所选区县'}
            },{
                name:'modify user address w/ town not belong to city',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address.city.id, townId:test_address_2.town.id}
                },
                result:{code: 1001, message: '所选乡镇不属于所选城市'}
            },{
                name:'modify user address w/ right province city and town',
                params:function(){
                    return {token:token, addressId: test_user_consignee_address_id, address:test_consignee.detail, areaId:test_address_4.province.id, receiptPhone:test_consignee.receiptPhone, receiptPeople:test_consignee.receiptPeople, cityId:test_address_4.city.id, townId:test_address_4.town.id}
                },
                result:{code:'1000'}
            }
            ];

            testCases.forEach(function (test) {
                Components.testGetAndPost(test.name)
                    .call('/api/v2.0/user/updateUserAddress')
                    .send(test.params)
                    .end(function (err, res) {
                        res.body.should.have.properties(test.result)
                    })
            })
        });

        describe('Delete user consignee address api', function () {
            var invalidCases = [{
                name: 'delete user address w/o address id ',
                params: function () {
                    return {token: token}
                },
                result: {'code': '1001', 'message': '请求参数错误，无效的addressId参数'}
            }];

            invalidCases.forEach(function (test) {
                Components.testGetAndPost(test.name)
                    .call('/api/v2.0/user/deleteUserAddress')
                    .send(test.params)
                    .end(function (err, res) {
                        res.body.should.have.properties(test.result)
                    })
            });
        })
    });
    describe('new user', function () {
        var test_user_token;
        beforeEach('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(){
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    var token = body.token;
                    var user = body.datas;
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

        afterEach('remove test user', function (done) {
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('register', function (done) {
            Routing.User.get_user_info(test_user_token, function (body) {
                var user = body.datas;
                user.should.have.properties('userid');
                user.should.not.have.properties('name', 'nickname', 'photo', 'dateinvited', 'address');
                user.should.have.properties({
                    sex: false,
                    isUserInfoFullFilled: false,
                    loginName: test_user.account,
                    phone: test_user.account,
                    isVerified: false,
                    isXXNRAgent: false,
                    isRSC: false,
                    RSCInfoVerifing: false,
                    userType: '1',
                    userTypeInName: '普通用户',
                    verifiedTypes: [],
                    verifiedTypesInJson: []
                });
                //TODO: get user list in backend, should contain this user
                done();
            })
        });

        it('full fill user info', function (done) {
            Routing.User.modify_user_info(test_user_token, {
                userName: test_user.name,
                address: {
                    provinceId: test_address.province.id,
                    cityId: test_address.city.id,
                    countyId: test_address.county.id,
                    townId: test_address.town.id
                }}, function(body){
                    body.should.have.property('code', '1000');
                    Routing.User.get_user_info(test_user_token, function (body) {
                        body.datas.should.containDeep({
                            name: test_user.name,
                            address: {
                                province: {
                                    name: test_data.test_address.province
                                },
                                city: {
                                    name: test_data.test_address.city
                                },
                                county: {
                                    name: test_data.test_address.county
                                },
                                town: {
                                    name: test_data.test_address.town
                                }
                            },
                            isUserInfoFullFilled: true,
                            pointLaterTrade: 100
                        });

                        done();
                    })
                })
        });

        it('update user info', function(done) {
            Routing.User.modify_user_info(test_user_token, {
                userName: test_user.name,
                nickname:test_user.nickname,
                sex:test_user.sex,
                type:'5',
                address: {
                    provinceId: test_address.province.id,
                    cityId: test_address.city.id,
                    countyId: test_address.county.id,
                    townId: test_address.town.id
                }
            }, function (body) {
                body.should.have.property('code', '1000');
                Routing.User.get_user_info(test_user_token, function(body){
                    body.datas.should.containDeep({
                        sex: true,
                        isUserInfoFullFilled: true,
                        loginName: test_user.account,
                        phone: test_user.account,
                        isVerified: false,
                        isXXNRAgent: false,
                        isRSC: false,
                        RSCInfoVerifing: false,
                        userType: '5',
                        userTypeInName: '县级经销商',
                        address:{
                            province:{name:test_data.test_address.province},
                            city:{name:test_data.test_address.city},
                            county:{name:test_data.test_address.county},
                            town:{name:test_data.test_address.town}
                        }
                    });
                    done();
                })
            })
        });

        it('upload user photo at website');
    });
    describe('verification', function () {
        var test_user_token;
        beforeEach('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(){
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    test_user_token = body.token;
                    done();
                });
            });
        });

        afterEach('remove test user', function (done) {
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('verify as XXNR agent', function (done) {
            Routing.User.query_user_types(function(body){
                body.should.have.properties({
                    code:1000,
                    data:{"1": "普通用户", "5": "县级经销商", "6": "新农经纪人"}
                });
                Routing.User.request_user_type('6', test_user_token, function (body) {
                body.should.have.property('code', '1000');
                Routing.User.get_user_info(test_user_token, function (body) {
                    var user = body.datas;
                    user.should.have.properties({
                        userType: '6',
                        userTypeInName: '新农经纪人',
                        verifiedTypes: [],
                        verifiedTypesInJson: [],
                        isXXNRAgent: false,
                        isVerified: false
                    });
                    //TODO:get this user in pending approval list in backend
                    Routing.User.verify_user_type(user.userid, ['6'], backend_admin_token, function () {
                        Routing.User.get_user_info(test_user_token, function (body) {
                            body.datas.should.have.properties({
                                userType: '6',
                                userTypeInName: '新农经纪人',
                                verifiedTypes: ['6'],
                                verifiedTypesInJson: [{typeId: '6', typeName: '新农经纪人'}],
                                isXXNRAgent: true,
                                isVerified: true
                            });
                            //TODO: get XXNR agent list in backend, should contain this user
                            done();
                        });
                    })
                })
            })
            })
        });

        it('verify as RSC', function (done) {
            Routing.User.request_user_type('5', test_user_token, function (body) {
                body.should.have.property('code', '1000');
                // fill RSC info
                var RSCInfo = test_user.RSCInfo;
                Routing.RSC.fill_RSC_info(test_user_token, RSCInfo.name, RSCInfo.IDNo, RSCInfo.phone, RSCInfo.companyName, {
                    province: test_address.province._id,
                    city: test_address.city._id,
                    county: test_address.county._id,
                    town: test_address.town._id
                }, function (body) {
                    body.should.have.property('code', 1000);
                    Routing.User.get_user_info(test_user_token, function (body) {
                        var user = body.datas;
                        user.should.have.containDeep({
                            userType: '5',
                            userTypeInName: '县级经销商',
                            verifiedTypes: [],
                            verifiedTypesInJson: [],
                            RSCInfoVerifing: true,
                            isVerified: false,
                            isRSC: false
                        });
                        request(app)
                            .get('/api/v2.2/RSC/info/get')
                            .query({token: test_user_token})
                            .end(function (err, res) {
                                should.not.exist(err);
                                res.body.should.have.containDeep({
                                    code: 1000,
                                    RSCInfo: {
                                        name: RSCInfo.name,
                                        IDNo: RSCInfo.IDNo,
                                        phone: RSCInfo.phone,
                                        companyName: RSCInfo.companyName,
                                        companyAddress: {
                                            province: {name: test_data.test_address.province},
                                            city: {name: test_data.test_address.city},
                                            county: {name: test_data.test_address.county},
                                            town: {name: test_data.test_address.town}
                                        }
                                    }
                                });

                                //TODO:modify RSCInfo 2nd time and cannot modify.
                                //TODO:get this user in pending approval list in backend
                                Routing.User.verify_user_type(user.userid, ['5'], backend_admin_token, function () {
                                    Routing.User.get_user_info(test_user_token, function (body) {
                                        body.datas.should.have.properties({
                                            userType: '5',
                                            userTypeInName: '县级经销商',
                                            verifiedTypes: ['5'],
                                            verifiedTypesInJson: [{typeId: '5', typeName: '县级经销商'}],
                                            RSCInfoVerifing: false,
                                            isVerified: true,
                                            isRSC: true
                                        });
                                        //TODO: get RSC list in backend, should contain this RSC
                                        done();
                                    })
                                })
                            });
                    })
                })
            })
        })
    });
    describe('loyalty point', function(){
        var test_user_token;
        before('create test user and login', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(user){
                Routing.User.frontendLogin(test_user.account, test_user.password, function(body){
                    test_user_token = body.token;
                    done();
                })
            })
        });

        after('delete test user', function(done){
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('sign', function(done){
            Routing.User.sign(test_user_token, function(body){
                body.should.have.property('code', '1000');
                Routing.User.get_user_info(test_user_token, function(body){
                    body.datas.should.have.property('pointLaterTrade', 2);
                    Routing.User.sign(test_user_token, function(body){
                        body.should.have.properties({
                            code:'1010',
                            message:'您今日已签到成功，明天再来呦！'
                        });
                        done();
                    })
                })
            })
        })
    });
    describe('modify password', function(){
        var test_user_token;
        before('create test user and login', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(user){
                Routing.User.frontendLogin(test_user.account, test_user.password, function(body){
                    test_user_token = body.token;
                    done();
                })
            })
        });

        after('delete test user', function(done){
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('modify password', function(done){
            var new_password = '123456';
            Routing.User.modify_password(test_user_token, test_user.password, new_password, function(body){
                body.should.have.property('code', '1000');
                Routing.User.frontendLogin(test_user.account, new_password, function(body){
                    var new_token = body.token;
                    Routing.User.get_user_info(new_token, function(body){
                        body.should.have.property('code', '1000');
                        Routing.User.get_user_info(test_user_token, function(body){
                            body.should.have.properties({
                                code:1401,
                                message:'您已在其他地方登录'
                            });
                            done();
                        })
                    })
                })
            })
        })
    });
    describe('consignee address', function(){
        var test_user_token;
        var test_address_2;
        var test_user_id;
        before('create test user and login', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(user){
                Routing.User.frontendLogin(test_user.account, test_user.password, function(body){
                    test_user_token = body.token;
                    test_user_id = body.userid;
                    done();
                })
            })
        });

        before('prepare test address 2', function(done){
            Routing.Address.get_address_by_name(test_data.test_address_2.province, test_data.test_address_2.city, test_data.test_address_2.county, test_data.test_address_2.town, function (err, address) {
                test_address_2 = address;
                done();
            })
        });

        after('delete test user', function(done){
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        after('delete user address', function(done){
            UserAddressModel.find({userid:test_user_id}).remove(done);
        });

        it('add user address -> query user address -> update user address -> delete user address', function(done){
            Routing.User.add_user_address({
                provinceId:test_address.province.id,
                cityId:test_address.city.id,
                countyId:test_address.county.id,
                townId:test_address.town.id,
                detail:test_user.user_address[0].detail,
                receiptPeople:test_user.user_address[0].receiptPeople,
                receiptPhone:test_user.user_address[0].receiptPhone
            }, test_user_token, function(body) {
                body.should.have.property('code', 1000);
                Routing.User.query_user_address(test_user_token, function(body){
                    body.should.containDeep({
                        code:'1000',
                        datas:{
                            total:1,
                            rows:[{
                                areaName:test_address.province.name,
                                areaId:test_address.province.id,
                                cityName:test_address.city.name,
                                cityId:test_address.city.id,
                                countyName:test_address.county.name,
                                countyId:test_address.county.id,
                                townName:test_address.town.name,
                                townId:test_address.town.id,
                                address:test_user.user_address[0].detail,
                                receiptPhone:test_user.user_address[0].receiptPhone,
                                receiptPeople:test_user.user_address[0].receiptPeople,
                                type:2
                            }]
                        }
                    });
                    Routing.User.add_user_address({
                        provinceId:test_address.province.id,
                        cityId:test_address.city.id,
                        countyId:test_address.county.id,
                        townId:test_address.town.id,
                        detail:test_user.user_address[1].detail,
                        receiptPeople:test_user.user_address[0].receiptPeople,
                        receiptPhone:test_user.user_address[0].receiptPhone
                    }, test_user_token, function(body) {
                        body.should.have.property('code', 1000);
                        var address_2_id = body.datas.addressId;
                        Routing.User.query_user_address(test_user_token, function(body) {
                            body.should.containDeep({
                                code: '1000',
                                datas: {
                                    total: 2,
                                    rows: [{
                                        address: test_user.user_address[0].detail,
                                        type: 2
                                    },
                                        {
                                            address: test_user.user_address[1].detail,
                                            type: 2
                                        }]
                                }
                            });
                            Routing.User.update_user_address(test_user_token, {
                                id: address_2_id,
                                provinceId: test_address_2.province.id,
                                cityId: test_address_2.city.id,
                                countyId: test_address_2.county.id,
                                townId: test_address_2.town.id,
                                details: test_user.user_address[0].detail,
                                receiptPhone: test_user.user_address[1].receiptPhone,
                                receiptPeople: test_user.user_address[1].receiptPeople,
                                type: 1
                            }, function (body) {
                                body.should.have.property('code', '1000');
                                Routing.User.query_user_address(test_user_token, function (body) {
                                    body.should.containDeep({
                                        code: '1000',
                                        datas: {
                                            total: 2,
                                            rows: [{
                                                areaName:test_address_2.province.name,
                                                areaId:test_address_2.province.id,
                                                cityName:test_address_2.city.name,
                                                cityId:test_address_2.city.id,
                                                countyName:test_address_2.county.name,
                                                countyId:test_address_2.county.id,
                                                townName:test_address_2.town.name,
                                                townId:test_address_2.town.id,
                                                address:test_user.user_address[0].detail,
                                                receiptPhone:test_user.user_address[1].receiptPhone,
                                                receiptPeople:test_user.user_address[1].receiptPeople,
                                                type: 1
                                            },
                                                {
                                                    areaName:test_address.province.name,
                                                    areaId:test_address.province.id,
                                                    cityName:test_address.city.name,
                                                    cityId:test_address.city.id,
                                                    countyName:test_address.county.name,
                                                    countyId:test_address.county.id,
                                                    townName:test_address.town.name,
                                                    townId:test_address.town.id,
                                                    address:test_user.user_address[0].detail,
                                                    receiptPhone:test_user.user_address[0].receiptPhone,
                                                    receiptPeople:test_user.user_address[0].receiptPeople,
                                                    type:2
                                                }]
                                        }
                                    });
                                    Routing.User.delete_user_address(test_user_token, address_2_id, function (body) {
                                        body.should.have.property('code', '1000');
                                        Routing.User.query_user_address(test_user_token, function (body) {
                                            body.should.containDeep({
                                                code:'1000',
                                                datas: {
                                                    total: 1
                                                }
                                            });
                                            done();
                                        })
                                    })
                                });
                            })
                        });
                    })
                })
            });
        });

        it('add user consignee', function(done){
            var test_consignee = test_user.consignee;
            Routing.User.save_user_consignee(test_user_token, test_consignee[0].name, test_consignee[0].phone, function(body){
                body.should.have.property('code', 1000);
                Routing.User.query_user_consignee(test_user_token, function(body){
                    body.should.containDeep({
                        code:1000,
                        datas:{
                            total:1,
                            page:1,
                            pages:1,
                            rows:[{
                                consigneeName:test_consignee[0].name,
                                consigneePhone:test_consignee[0].phone
                            }]
                        }
                    });
                    done();
                })
            })
        })
    });
});
