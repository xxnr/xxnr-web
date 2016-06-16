/**
 * Created by pepelu on 2016/5/23.
 */
var NodeRSA = require('node-rsa');
var app = require('../../../release');
var supertest = require('supertest');
var request = supertest(app);
var should = require('should');
var config = require('./config');
var extend = require('extend');

exports.login = function(callback) {
    exports.getPublicKey(function (err, public_key) {
        var encryptedPassword = new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(config.user.right_password, 'base64', 'utf-8');
        request.get('/api/v2.0/user/login')
            .query({account: config.user.account, password: encryptedPassword})
            .end(function (err, res) {
                if (err) {
                    throw err;
                }

                callback(res.body.token);
            })
    })
};

exports.getPublicKey = function(callback){
    request.get('/api/v2.0/user/getpubkey')
        .end(function (err, res) {
            callback(err, res.body.public_key);
        })
};

exports.testGetAndPost = function(caseName,cookie){
    return new GetAndPostTest(caseName, cookie);
};

function GetAndPostTest(caseName) {
    var getReqRoute, postReqRoute, getReqQuery, postReqBody;
    var token;
    this.call = function (apiStr) {
        getReqRoute = postReqRoute = apiStr;
        return this;
    };

    this.send = function (params) {
        getReqQuery = postReqBody = params;
        return this;
    };

    this.token = function (fn) {
        token = fn;
        return this;
    };

    this.end = function (fn) {
        it(caseName + ' (get)', function (done) {
            // can only be execute here because we are waiting for some value in before block.
            if (typeof getReqQuery === 'function') {
                getReqQuery = getReqQuery();
            }

            if (token) {
                if (typeof token === 'function') {
                    getReqQuery = extend(true, getReqQuery, {token: token()});
                } else {
                    getReqQuery = extend(true, getReqQuery, {token: token});
                }
            }

            request.get(getReqRoute)
                .query(getReqQuery)
                .end(function (err, res) {
                    should.not.exist(err);
                    fn(err, res);
                    done();
                })
        });

        it(caseName + ' (post)', function (done) {
            if (typeof postReqBody === 'function') {
                postReqBody = postReqBody();
            }

            if (token) {
                if (typeof token === 'function') {
                    postReqBody = extend(true, postReqBody, {token: token()});
                } else {
                    postReqBody = extend(true, postReqBody, {token: token});
                }
            }
            request.post(postReqRoute)
                .send(postReqBody)
                .end(function (err, res) {
                    should.not.exist(err);
                    fn(err, res);
                    done();
                })
        })
    };
}

exports.request = request;