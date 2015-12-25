/**
 * Created by pepelu on 2015/11/23.
 */
var bcrypt = require('bcrypt-nodejs');
var BackEndUserModel = require('../models').backenduser;
var BusinessModel = require('../models').business;

// Service
var BackEndUserService = function(){};

// Method
// Create user
BackEndUserService.prototype.create = function(options, callback) {
    BackEndUserModel.findOne({account: options.account}, function (err, doc) {
        if (doc) {
            callback('用户已存在');
            return;
        }
        var user = new BackEndUserModel(options);
        user.password = bcrypt.hashSync(options.password);

        if (options.useragent)
            user.registerAgent = options.useragent;

        user.save(function (err) {
            callback(err, user);
        })
    });
};

// Login
BackEndUserService.prototype.login = function(options, callback) {
    if(!options.account || !options.password){
        callback('need account and password');
        return;
    }

    // Gets a specific document from DB
    BackEndUserModel.findOne({account:options.account}, function(err, user){
        if(err){
            console.log('user login fail: ' + err);
            callback('登录失败');
            return;
        }

        if (user === null) {
            callback('账号不存在');
            return;
        }

        var password_valid = false;
        try{
            password_valid = bcrypt.compareSync(options.password, user.password);
        } catch(e){
        }

        if(password_valid){
            callback(null, user);
        }else {
            // Returns response
            callback('密码错误');
        }
    });
};

// Gets a specific user
BackEndUserService.prototype.get = function(options, callback) {
    if(!options._id){
        callback('need id');
        return;
    }

    var query = options.account ;

    // Gets a specific document from DB
    BackEndUserModel.findOne({_id:options._id})
        .populate('role')
        .populate('business')
        .exec(function (err, user) {
            if (err) {
                console.log('get user error: ' + err);
                callback('获取用户信息失败');
                return;
            }

            if (!user) {
                callback('未查询到用户');
                return;
            }

            // Returns response
            return callback(null, user);
        });
};

BackEndUserService.prototype.update = function(options, callback) {
    if (!options._id) {
        // if no userid or account provided, not support.
        callback('need userid');
        return;
    }

    var setValue = {};
    if (options.password)
        setValue.password = bcrypt.hashSync(options.password);
    if (options.appLoginId)
        setValue.appLoginId = options.appLoginId;
    if (options.webLoginId)
        setValue.webLoginId = options.webLoginId;
    if (options.role)
        setValue.role = options.role;
    if(options.business)
        setValue.business = options.business;

    BackEndUserModel.update({_id:options._id}, {$set: setValue}, {new: true, multi: false}, function (err, numAffected) {
        if (err) {
            console.log('User Service update err:' + err);
            callback('用户更新失败');
            return;
        }

        if (numAffected.n == 0) {
            console.log('User Service update err: user not exists');
            callback('用户不存在');
            return;
        }

        callback();
    });
};

BackEndUserService.prototype.validate_password = function(account, decryptedPassword, callback){
    BackEndUserService.findOne({account:account}, function(err, user){
        if(err){
            callback('validate fail' + err, false);
            return;
        }

        if (user === null) {
            callback('账号不存在', false);
            return;
        }

        var password_valid = false;
        try{
            password_valid = bcrypt.compareSync(decryptedPassword, user.password);
        } catch(e){
        }

        if(password_valid){
            callback(null, true);
        }else {
            // Returns response
            callback('密码错误', false);
        }
    });
};

BackEndUserService.prototype.getUserList = function(callback){
    BackEndUserModel.find({})
        .populate('role')
        .populate('business')
        .exec(callback);
};

BackEndUserService.prototype.getBusinessList = function(callback){
    BusinessModel.find({}, callback);
};

module.exports = new BackEndUserService();