/**
 * Created by pepelu on 2015/11/18.
 */
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var UserModel = require('../models').user;
var UserLogModel = require('../models').userLog;
var UseOrdersNumberModel = require('../models').userordersnumber;

// Service
UserService = function(){};

// Method
// Creates user
UserService.prototype.create = function(options, callback) {
    UserModel.findOne({account: options.account}, function (err, doc) {
        if (doc) {
            callback('用户已存在');
            return;
        } else {
            var user = new UserModel(options);
            user.id = U.GUID(10);
            user.password = bcrypt.hashSync(options.password);

            if(options.useragent)
                user.registerAgent = options.useragent;

            user.save(function (err) {
                callback(err, user);
            });
        }
    });
};

// Updates user
UserService.prototype.update = function(options, callback) {
    // generate query
    var query = options.userid ? {id: options.userid} : options.id ? {id: options.id} : options.account ? {account: options.account} : {};
    if (query == {}) {
        // if no userid or account provided, not support.
        callback('need userid or accountid');
        return;
    }

    var setValue = {};
    if (options.password)
        setValue.password = bcrypt.hashSync(options.password);
    if (options.name)
        setValue.name = options.name;
    if (options.regMethod)
        setValue.regmethod = options.regMethod;
    if (options.nickname)
        setValue.nickname = options.nickname;
    if (options.type)
        setValue.type = options.type;
    if (options.sex)
        setValue.sex = options.sex;
    if (options.photo)
        setValue.photo = options.photo;
    if (options.inviter)
        setValue.inviter = options.inviter;
    if (options.dateinvited)
        setValue.dateinvited = options.dateinvited;
    if (options.appLoginId)
        setValue.appLoginId = options.appLoginId;
    if (options.webLoginId)
        setValue.webLoginId = options.webLoginId;
    if (options.address)
        setValue.address = options.address;
    if (options.isVerified && options.type != '1')
        setValue.typeVerified = options.type;
    if (options.isVerified === false)
        setValue.typeVerified = null;
    if( typeof options.isUserInfoFullFilled != 'undefined')
        setValue.isUserInfoFullFilled = options.isUserInfoFullFilled;

    UserModel.update(query, {$set: setValue}, {new: true, multi: false}, function (err, numAffected) {
        if (err) {
            console.error('User Service update err:', err);
            callback('用户更新失败');
            return;
        }

        if (numAffected.n == 0) {
            console.error('User Service update err: user not exists');
            callback('用户不存在');
            return;
        }

        callback();
    });
};

// Login
UserService.prototype.login = function(options, callback) {
    if(!options.account || !options.password){
        callback('请输入用户名和密码');
        return;
    }

    // Gets a specific document from DB
    UserModel.findOne({account:options.account})
        .populate({path:'address.province', select:'-_id -__v'})
        .populate({path:'address.city', select:'-_id -__v'})
        .populate({path:'address.county', select:'-_id -__v'})
        .populate({path:'address.town', select:'-_id -__v'})
        .exec(function(err, user){
        if(err){
            console.error('user login fail:', err);
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
        if(password_valid) {
            // v2.0 user
        }
        else{
            // try to use md5 hash to keep compatible with v1.0 user
            // calculate md5 hash
            var hasher=crypto.createHash("md5");
            hasher.update(options.password + '_stormy');//'_stormy' is salt number for v1.0
            var hash_md5=hasher.digest('hex');
            if(hash_md5 == user.password){
                password_valid = true;
            }
        }

        if(password_valid){
            if(user.typeVerified && user.typeVerified === user.type && user.type != '1'){
                user = user.toObject();
                user.isVerified = true;
            }

            callback(null, user);

            // Save login log
            var userLog = new UserLogModel({id: user.id, account: user.account, ip: options.ip, date: new Date().format('yyyy-MM-dd hh:mm:ss'), loginAgent:options.useragent});
            userLog.save(function(){});
        }else {
            // Returns response
            callback('密码错误');
        }
    });
};

// Gets a specific user
UserService.prototype.get = function(options, callback) {
    if (!options.userid && !options.account) {
        callback('need userid or accountid');
        return;
    }

    var query = options.userid ? {id: options.userid} : options.account ? {account: options.account} : {};

    // Gets a specific document from DB
    UserModel.findOne(query)
        .populate({path: 'address.province', select: ' -__v'})
        .populate({path: 'address.city', select: ' -__v'})
        .populate({path: 'address.county', select: ' -__v'})
        .populate({path: 'address.town', select: ' -__v'})
        .populate({path: 'inviter', select: 'id account photo nickname name'})
        .exec(function (err, user) {
            if (err) {
                console.error('get user error:', err);
                callback('获取用户信息失败');
                return;
            }

            if (!user) {
                callback('未查询到用户');
                return;
            }

            if (user.typeVerified && user.typeVerified === user.type && user.type != '1') {
                user = user.toObject();
                user.isVerified = true;
            }

            // Returns response
            return callback(null, user);
        });
};

UserService.prototype.increaseScore = function(options, callback){
    if(!options.userid){
        callback('userid required');
        return;
    }

    if(!options.score){
        callback('score required');
        return;
    }

    UserModel.update({id:options.userid}, {$inc:{score: parseInt(options.score)}}, function(err, numAffected){
        if(err){
            console.error('increaseScore err:', err);
            callback('增加积分失败');
            return;
        }

        if(numAffected.n == 0){
            callback('用户不存在');
            return;
        }

        callback();
    })
};

UserService.prototype.getInvitee = function(options, callback) {
    if (!options._id) {
        callback('_id required');
        return;
    }

    // UserModel.find({$query:{inviter: options._id}, $orderby:{dateinvited: -1}}, function (err, docs) {
    UserModel.find({inviter: options._id})
        .sort({dateinvited:-1})
        .lean()
        .exec(function(err, docs) {
            if (err) {
                console.error('User workflow getInvitee error:', err);
                callback('获取新农客户失败');
            }

            callback(null, docs);
        });
};

UserService.prototype.getOneInvitee = function(options, callback) {
    if (!options._id || !options.inviteeId) {
        callback('_id or inviteeId required');
        return;
    }

    UserModel.findOne({inviter: options._id, id:options.inviteeId}, function(err, doc) {
        if (err) {
            console.error('User workflow getOneInvitee error:', err);
            callback('获取新农客户失败');
        }

        callback(null, doc);
    });
};

// get invitees order number
UserService.prototype.getInviteeOrderNumber = function(invitees, callback) {

    if (!invitees || invitees.length === 0) {
        callback(null, []);
        return;
    }

    UseOrdersNumberModel.find({userId:{$in:invitees}}).sort({dateUpdated:-1}).lean().exec(function (err, docs) {
        if (err) {
            console.error('User emptyInviteeOrderNumber findOne err:', err);
            callback(null, []);
            return;
        }
        callback(null, docs);
    });
};

// empty the invitee order number by inviter
UserService.prototype.emptyInviteeOrderNumber = function(options, callback) {

    if (!options.inviteeId) {
        console.error('User emptyInviteeOrderNumber err: no inviteeId');
        return;
    }

    UseOrdersNumberModel.findOne({userId:options.inviteeId}, function (err, doc) {
        if (err) {
            console.error('User emptyInviteeOrderNumber findOne err:', err);
            return;
        }
        if (doc) {
            UseOrdersNumberModel.update({userId:doc.userId}, {$set:{numberForInviter:0, dateUpdated: new Date()}}, function(err, count) {
                // Record not exists
                if (err) {
                    console.error('User emptyInviteeOrderNumber update err:', err);
                    return;
                }
                if (count.n === 0) {
                    console.error('User emptyInviteeOrderNumber update not find doc');
                }
            });
        }
    });
};

// ********************  only use for manager system  ********************

// Gets listing
UserService.prototype.query = function(options, callback) {

    // options.search {String}
    // options.page {String or Number}
    // options.max {String or Number}

    // page max num
    var pagemax = 50;
    var max = U.parseInt(options.max, 20);
    options.page = U.parseInt(options.page) - 1;
    options.max = max > pagemax ? pagemax : max;

    if (options.page < 0)
        options.page = 0;

    var take = U.parseInt(options.max);
    var skip = U.parseInt(options.page * options.max);

    var query = {};
    if (options.query){
         query = {$where: options.query};
    }

    // Prepares searching
    if (options.search)
        query.$text = {$search:options.search};

    UserModel.count(query, function (err, count) {
        if (err) {
            callback(err);
            return;
        }

        UserModel.find(query)
            .sort({datecreated: -1})
            .skip(skip)
            .limit(take)
            .populate({path:'inviter', select:'-_id id account photo nickname'})
            .exec(function (err, docs) {
                if (err) {
                    callback(err);
                    return;
                }

                var data = {};
                data.count = count;
                data.items = docs;

                // Gets page count
                data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);
                if (data.pages === 0)
                    data.pages = 1;
                data.page = options.page + 1;

                // Returns data
                callback(null, data || []);
            })
    })
};

module.exports = new UserService();