/**
 * Created by pepelu on 2016/5/23.
 */
var should = require('should');
var common = require('../common');
var request = common.request;
var config = require('../config');
var NodeRSA = require('node-rsa');
var cookieParser = require('cookie');
var supertest = require('supertest');

describe('User', function () {
    describe('Public key', function () {
        common.testGetAndPost('get public key to encrypt password')
            .call('/api/v2.0/user/getpubkey')
            .end(function (err, res) {
                res.body.should.have.property('code', 1000);
                res.body.should.have.property('public_key').match(/.+/);
            })
    });

    describe('Login', function () {
        var public_key;
        var api = '/api/v2.0/user/login';
        before(function (done) {
            common.getPublicKey(function (err, publicKey) {
                if (err) {
                    should.not.exist(err);
                }

                public_key = publicKey;
                done();
            });
        });

        var userLoginValidator = function (res, keepLogin) {
            res.body.should.have.property('code', '1000');
            res.body.should.have.properties('datas', 'token');
            res.body.token.should.match(/.+/);
            res.body.datas.should.have.properties('userid', 'nickname', 'loginName', 'name', 'phone', 'sex', 'photo', 'userAddress', 'isUserInfoFullFilled', 'isVerified', 'isXXNRAgent', 'isRSC', 'RSCInfoVerifing', 'userType', 'userTypeInName', 'verifiedTypes', 'verifiedTypesInJson', 'cartId');
            res.body.datas.userAddress.should.have.properties('province', 'city');
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

        common.testGetAndPost('user login api w/o account')
            .call(api)
            .send({password: config.user.right_password})
            .end(function (err, res) {
                res.body.should.have.properties({
                    'code': 1001,
                    'message': '请输入账号'
                });
            });

        common.testGetAndPost('user login api w/o password')
            .call(api)
            .send({account: config.user.account})
            .end(function (err, res) {
                res.body.should.have.properties({
                    'code': 1001,
                    'message': '请输入密码'
                });
            });

        common.testGetAndPost('user login api w/o keepLogin')
            .call(api)
            .send(function () {
                return {
                    account: config.user.account,
                    password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(config.user.right_password, 'base64', 'utf-8'))
                }
            })
            .end(function (err, res) {
                userLoginValidator(res, true);
            });

        common.testGetAndPost('user login api w/ keepLogin=false')
            .call(api)
            .send(function () {
                return {
                    account: config.user.account,
                    password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(config.user.right_password, 'base64', 'utf-8')),
                    keepLogin: false
                }
            })
            .end(function (err, res) {
                userLoginValidator(res, false);
            });

        common.testGetAndPost('user login api w/ keepLogin=true')
            .call(api)
            .send(function () {
                return {
                    account: config.user.account,
                    password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(config.user.right_password, 'base64', 'utf-8'))
                }
            })
            .end(function (err, res) {
                userLoginValidator(res, true);
            })
    });

    describe('Register', function () {
        var api = '/api/v2.0/user/register';
        var public_key;
        before(function (done) {
            common.getPublicKey(function (err, publicKey) {
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
                    'code': '1001',
                    'message': '请输入正确的11位手机号'
                }
            },
            {
                name: 'user register api w/ invalid account',
                params: {account: '111'},
                result: {
                    'code': '1001',
                    'message': '请输入正确的11位手机号'
                }
            },
            {
                name: 'user register api w/o vCode',
                params: {account: config.user.account},
                result: {
                    'code': '1001',
                    'message': '请输入验证码'
                }
            },
            {
                name: 'user register api w/o password',
                params: {account: config.user.account, smsCode: '123456'},
                result: {
                    'code': '1001',
                    'message': '请输入密码'
                }
            },
            {
                name: 'user register api w/ invalid password',
                params: function () {
                    return {
                        account: config.user.account,
                        smsCode: '123456',
                        password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt('12345', 'base64', 'utf-8'))
                    }
                },
                result: {
                    'code': '1001',
                    'message': '密码长度需不小于6位'
                }
            },
            {
                name: 'user register api w/o vCode send',
                params: function () {
                    return {
                        account: config.user.account,
                        smsCode: '123456',
                        password: encodeURI(new NodeRSA(public_key, 'pkcs8-public-pem').encrypt('123456', 'base64', 'utf-8'))
                    }
                },
                result: {
                    'code': '1001',
                    'message': '没有查找到验证码'
                }
            }];

        invalidTests.forEach(function (test) {
            common.testGetAndPost(test.name)
                .call(api)
                .send(test.params)
                .end(function (err, res) {
                    res.body.should.have.properties(test.result)
                })
        })
    });

    describe('Get', function () {
        var api = '/api/v2.0/user/get';
        var token;
        before(function (done) {
            common.login(function (tk) {
                token = tk;
                done();
            });
        });

        common.testGetAndPost('user get api w/o login')
            .call(api)
            .end(function (err, res) {
                res.body.should.have.properties({
                    code: 1401,
                    message: '请先登录'
                })
            });

        common.testGetAndPost('user get api w/ login')
            .token(function () {
                return token;
            })
            .call(api)
            .end(function (err, res) {
                res.body.should.containDeep({
                    code: '1000',
                    message: 'success',
                    datas: {
                        phone: config.user.account
                    }
                });
                res.body.datas.should.have.properties('userid', 'nickname', 'loginName', 'name', 'sex', 'pointLaterTrade', 'isUserInfoFullFilled', 'isVerified', 'isXXNRAgent', 'isRSC', 'RSCInfoVerifing', 'userType', 'userTypeInName', 'verifiedTypes', 'verifiedTypesInJson');
                res.body.datas.photo.match(/\/.+\..+/);
                res.body.datas.pointLaterTrade.should.be.type('number');
                res.body.datas.address.should.have.properties('province', 'city');
                res.body.datas.isUserInfoFullFilled.should.be.type('boolean');
                res.body.datas.isVerified.should.be.type('boolean');
                res.body.datas.isXXNRAgent.should.be.type('boolean');
                res.body.datas.isRSC.should.be.type('boolean');
                res.body.datas.RSCInfoVerifing.should.be.type('boolean');
            })
    });
});