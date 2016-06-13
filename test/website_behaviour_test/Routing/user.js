/**
 * Created by pepelu on 2016/6/2.
 */
var config = require('../../../config');
var NodeRSA = require('node-rsa');
var request = require('supertest');
var app = require('../../../release');
var models = require('../../../models');
var BackendUserModel = models.backenduser;
var should = require('should');
var rolesModel = models.role;
var bcrypt = require('bcrypt-nodejs');
var services = require('../../../services');
var UserService = services.user;
var UserModel = models.user;

exports.backendLogin = function(account, password, callback) {
    encryptPassword(password, function (err, encryptedPassword) {
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
    encryptPassword(password, function (err, encryptedPassword) {
        request(app)
            .post('/api/v2.0/user/login')
            .send({account: account, password: encryptedPassword})
            .end(function (err, res) {
                should.not.exist(err);
                callback(res.body);
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
                password: hashPassword(password),
                role: role._id
            });

            admin_model.save(function (err) {
                done(err);
            })
        })
    })
};

exports.create_frontend_account = function(account, password, done){
    UserModel.findOne({account: account}).remove(function (err) {
        should.not.exist(err);
        UserService.create({account: account, password: password}, function (err, user) {
            should.not.exist(err);
            done(user);
        })
    })
};

exports.delete_backend_account = function(account, done){
    BackendUserModel.findOne({account:account}).remove(done);
};

exports.delete_frontend_account = function(account, done){
    UserModel.findOne({account: account}).remove(function (err) {
        should.not.exist(err);
        done();
    });
};

exports.verify_user_type = function(userId, types, token, callback) {
    request(app)
        .put(config.manager_url + '/api/users')
        .send({id:userId, typeVerified: types, token: token})
        .end(function (err, res) {
            should.not.exist(err);
            res.body.should.have.property('code', 1000);
            callback();
        })
};

exports.get_user_info = function(token, callback) {
    request(app)
        .get('/api/v2.0/user/get')
        .query({token: token})
        .end(function (err, res) {
            should.not.exist(err);
            callback(res.body);
        });
};

exports.modify_user_info = function(token, user, done){
    request(app)
        .post('/api/v2.0/user/modify')
        .send(user)
        .send({
            token: token
        })
        .end(function (err, res) {
            should.not.exist(err);
            done(res.body);
        });
};

exports.upload_photo = function(token, imgPath, done){
    request(app)
        .post('/api/v2.0/user/uploadPortrait')
        .field('token', token)
        .attach('image', imgPath)
        .end(function(err, res) {
            should.not.exist(err);
            done(res.body);
        });
};

exports.request_user_type = function(type, token, done){
    request(app)
        .post('/api/v2.0/user/modify')
        .send({type:type, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.is_potential_customer_available = function(phone, XXNRAgent_token, done){
    request(app)
        .get('/api/v2.1/potentialCustomer/isAvailable')
        .query({phone:phone, token:XXNRAgent_token})
        .end(function(err, res) {
            should.not.exist(err);
            done(res.body);
        });
};

exports.add_potential_customer = function(potential_customer, XXNRAgent_token, done){
    request(app)
        .post('/api/v2.1/potentialCustomer/add')
        .send(potential_customer)
        .send({token:XXNRAgent_token})
        .end(function (err, res) {
            should.not.exist(err);
            done(res.body);
        });
};

exports.query_potential_customers = function(XXNRAgent_token, done){
    request(app)
        .get('/api/v2.1/potentialCustomer/query')
        .query({token: XXNRAgent_token})
        .end(function (err, res) {
            should.not.exist(err);
            done(res.body);
        });
};

exports.get_potential_customer = function(XXNRAgent_token, id, done){
    request(app)
        .get('/api/v2.1/potentialCustomer/get')
        .query({_id: id, token: XXNRAgent_token})
        .end(function (err, res) {
            should.not.exist(err);
            done(res.body);
        });
};

exports.get_nominated_inviter = function(token, done){
    request(app)
        .get('/api/v2.1/user/getNominatedInviter')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.bind_inviter = function(token, inviter, done){
    request(app)
        .post('/api/v2.0/user/bindInviter')
        .send({token:token, inviter:inviter})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.get_inviter = function(token, done){
    request(app)
        .get('/api/v2.0/user/getInviter')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_invitee = function(token, done){
    request(app)
        .get('/api/v2.0/user/getInvitee')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_user_types = function(done){
    request(app)
        .get('/api/v2.0/usertypes')
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.add_user_address = function(address, token ,done) {
    request(app)
        .post('/api/v2.0/user/saveUserAddress')
        .send({
            areaId: address.provinceId,
            cityId: address.cityId,
            countyId: address.countyId,
            townId: address.townId,
            address: address.detail,
            receiptPeople: address.receiptPeople,
            receiptPhone: address.receiptPhone,
            token: token
        })
        .end(function (err, res) {
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_user_address = function(token, done){
    request(app)
        .get('/api/v2.0/user/getUserAddressList')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.update_user_address = function(token, address, done) {
    request(app)
        .post('/api/v2.0/user/updateUserAddress')
        .send({
            token: token,
            addressId: address.id,
            areaId: address.provinceId,
            cityId: address.cityId,
            countyId: address.countyId,
            townId: address.townId,
            address: address.details,
            receiptPhone: address.receiptPhone,
            receiptPeople: address.receiptPeople,
            type: address.type
        })
        .end(function (err, res) {
            should.not.exist(err);
            done(res.body);
        });
};

exports.query_invitee_order = function(inviteeId, token, done){
    request(app)
        .get('/api/v2.0/user/getInviteeOrders')
        .query({inviteeId:inviteeId, token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.sign = function(token, done){
    request(app)
        .post('/api/v2.0/user/sign')
        .send({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.modify_password = function(token, oldPassword, newPassword, done){
    encryptPassword(oldPassword, function(err, encryptedOldPassword){
        should.not.exist(err);
        encryptPassword(newPassword, function(err, encryptedNewPassword){
            should.not.exist(err);
            request(app)
                .post('/api/v2.0/user/modifypwd')
                .send({
                    token:token,
                    oldPwd:encryptedOldPassword,
                    newPwd:encryptedNewPassword
                })
                .end(function(err, res){
                    should.not.exist(err);
                    done(res.body);
                })
        })
    })
};

exports.save_user_consignee = function(token, consigneeName, consigneePhone, done){
    request(app)
        .post('/api/v2.2/user/saveConsignees')
        .send({token:token, consigneeName:consigneeName, consigneePhone:consigneePhone})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

exports.query_user_consignee = function(token, done){
    request(app)
        .get('/api/v2.2/user/queryConsignees')
        .query({token:token})
        .end(function(err, res){
            should.not.exist(err);
            done(res.body);
        })
};

var hashPassword = function(password){
    return bcrypt.hashSync(password);
};

var getPublicKey = function(callback) {
    request(app)
        .get('/api/v2.0/user/getpubkey')
        .end(function (err, res) {
            callback(err, res.body.public_key);
        })
};

var encryptPassword = function(password, callback) {
    getPublicKey(function (err, public_key) {
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
