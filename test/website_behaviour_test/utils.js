/**
 * Created by pepelu on 2016/5/30.
 */
var config = require('../../config');
var NodeRSA = require('node-rsa');
var bcrypt = require('bcrypt-nodejs');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var BackendUserModel = models.backenduser;
var rolesModel = models.role;

exports.hashPassword = function(password){
    return bcrypt.hashSync(password);
};

exports.getPublicKey = function(callback) {
    request(app)
        .get('/api/v2.0/user/getpubkey')
        .end(function (err, res) {
            callback(err, res.body.public_key);
        })
};

exports.encryptPassword = function(password, callback) {
    exports.getPublicKey(function (err, public_key) {
        if (err) {
            callback(err);
            return;
        }

        try {
            var encryptedPassword = new NodeRSA(public_key, 'pkcs8-public-pem').encrypt(password, 'base64', 'utf-8');
        } catch (ex) {
            callback(ex);
            return;
        }

        callback(null, encryptedPassword);
    })
};

exports.backendLogin = function(account, password, callback) {
    exports.encryptPassword(password, function (err, encryptedPassword) {
        request(app)
            .post(config.manager_url + '/api/login')
            .send({account: account, password: encryptedPassword})
            .end(function (err, res) {
                if (err) {
                    callback(err);
                    return;
                }

                if (!res.body.token) {
                    callback('login fail');
                    return;
                }

                callback(null, res.body.token);
            })
    })
};

exports.frontendLogin = function(account, password, callback) {
    exports.encryptPassword(password, function (err, encryptedPassword) {
        request(app)
            .post('/api/v2.0/user/login')
            .send({account: account, password: encryptedPassword})
            .end(function (err, res) {
                if (err) {
                    callback(err);
                    return;
                }

                if (!res.body.token) {
                    callback('login fail');
                    return;
                }

                callback(null, res.body.token, res.body.datas);
            })
    })
};

exports.create_backend_account = function(account, password, role, done){
    BackendUserModel.findOne({account:account}).remove(function(err){
        if(err){
            done(err);
            return;
        }

        rolesModel.findOne({name:role}, function(err, role) {
            if(err){
                done(err);
                return;
            }

            var admin_model = new BackendUserModel({
                account: account,
                password: exports.hashPassword(password),
                role: role._id
            });

            admin_model.save(function (err) {
                done(err);
            })
        })
    })
};

exports.delete_backend_account = function(account, done){
    BackendUserModel.findOne({account:account}).remove(done);
};