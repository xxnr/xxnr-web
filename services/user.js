/**
 * Created by pepelu on 2015/11/18.
 */
var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var tools = require('../common/tools');
var crypto = require('crypto');
var UserModel = require('../models').user;
var UserLogModel = require('../models').userLog;
var UseOrdersNumberModel = require('../models').userordersnumber;
var UserWhiteListModel = require('../models').userwhitelist;
var UserConsigneeModel = require('../models').userconsignee;
var UserRSCModel = require('../models').userRSC;

// Service
var UserService = function(){};

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
        //TODO:this condition cannot judge whether query is empty!!!!!!!
        // if no userid or account provided, not support.
        callback('need userid or accountid');
        return;
    }

    var setValue = {};
    if (options.password)
        setValue.password = bcrypt.hashSync(options.password);
    if (options.name) {
        setValue.name = options.name;
        var nameResult = tools.stringPinyin({'str':options.name});
        if (nameResult) {
            if (nameResult.error)
                console.error('UserService update name stringPinyin error:', nameResult.error, options.name);
            if (nameResult.strPinyin)
                setValue.namePinyin = nameResult.strPinyin;
            if (nameResult.initial)
                setValue.nameInitial = nameResult.initial;
            if (nameResult.initialType)
                setValue.nameInitialType = nameResult.initialType;
        }
    }
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
    if (options.appLoginAgent)
        setValue.appLoginAgent = options.appLoginAgent;
    if (options.webLoginId)
        setValue.webLoginId = options.webLoginId;
    if (options.address)
        setValue.address = options.address;
    if (options.typeVerified)
        setValue.typeVerified = options.typeVerified;
    if( typeof options.isUserInfoFullFilled != 'undefined')
        setValue.isUserInfoFullFilled = options.isUserInfoFullFilled;

    // RSC info
    if(options.RSCInfo){
        if(options.RSCInfo.name) {
            setValue['RSCInfo.name'] = options.RSCInfo.name;
        }

        if(options.RSCInfo.IDNo) {
            setValue['RSCInfo.IDNo'] = options.RSCInfo.IDNo;
        }

        if(options.RSCInfo.phone){
            setValue['RSCInfo.phone'] = options.RSCInfo.phone;
        }

        if(options.RSCInfo.companyName){
            setValue['RSCInfo.companyName'] = options.RSCInfo.companyName;
        }

        if(options.RSCInfo.companyAddress){
            setValue['RSCInfo.companyAddress'] = options.RSCInfo.companyAddress;
        }
    }

    UserModel.update(query, {$set: setValue}, {new: true, multi: false}, function (err, numAffected) {
        if (err) {
            console.error('User Service update err:', err);
            callback('用户更新失败');
            return;
        }

        if (numAffected.n == 0) {
            console.error('User Service update err: update fail');
            callback('更新失败');
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
            console.error('User Service user login fail:', err);
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
            user = user.toObject();
            getMoreUserInfo(user);
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
                console.error('User Service get user error:', err);
                callback('获取用户信息失败');
                return;
            }

            if (!user) {
                callback('未查询到用户');
                return;
            }

            user = user.toObject();
            getMoreUserInfo(user);

            // Returns response
            return callback(null, user);
        });
};

function getMoreUserInfo(user){
    user.isVerified = isUserTypeVerified(user);
    user.isXXNRAgent = tools.isXXNRAgent(user.typeVerified);
    user.isRSC = tools.isRSC(user.typeVerified);
}

function isUserTypeVerified(user){
    return user.typeVerified && user.typeVerified.indexOf(user.type) != -1 && user.type != '1'
}

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
            console.error('User Service increaseScore err:', err);
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

UserService.prototype.getInviteeOrderbynamePinyin = function(options, callback) {
    if (!options._id) {
        callback('_id required');
        return;
    }
    var time = new Date();

    // UserModel.find({inviter: options._id})
    //     .sort({nameInitialType:1, namePinyin:1, dateinvited:-1})
    //     .lean()
    //     .exec(function(err, docs) {
    //         if (err) {
    //             console.error('User Service getInviteeOrderbynamePinyin error:', err);
    //             callback('获取新农客户失败');
    //         }

    //         var data = {};
    //         data.count = docs?docs.length:docs;
    //         data.items = docs;
    //         callback(null, data);
    //     });
    UserModel.collection.find({inviter: mongoose.Types.ObjectId(options._id)})
        .sort({nameInitialType:1, namePinyin:1, dateinvited:-1})
        .toArray(function(err, docs) {
            if (err) {
                console.error('User Service getInviteeOrderbynamePinyin error:', err);
                callback('获取新农客户失败');
            }
            var data = {};
            data.count = docs?docs.length:docs;
            data.items = docs;
            callback(null, data);
        });
};

UserService.prototype.getInvitee = function(options, callback) {
    if (!options._id) {
        callback('_id required');
        return;
    }

    // page max num
    var pagemax = 20;
    var max = U.parseInt(options.max, 20);
    options.page = U.parseInt(options.page) - 1;
    options.max = max > pagemax ? pagemax : max;

    if (options.page < 0)
        options.page = 0;

    var query = {inviter:options._id};
    if(options.search){
        query['$or'] = [{account:options.search}, {name:{$regex:new RegExp(options.search)}}];
    }

    var take = U.parseInt(options.max);
    var skip = U.parseInt(options.page * options.max);
    // UserModel.find({$query:{inviter: options._id}, $orderby:{dateinvited: -1}}, function (err, docs) {
    UserModel.count(query, function(err, count) {
        if(err){
            console.error('User Service getInvitee error:', err);
            callback(err);
            return;
        }
        UserModel.find(query)
            .sort({dateinvited:-1})
            .skip(skip)
            .limit(take)
            .lean()
            .exec(function(err, docs) {
                if (err) {
                    console.error('User Service getInvitee error:', err);
                    callback('获取新农客户失败');
                }

                var data = {};
                data.count = count;
                data.items = docs;
                data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);

                if (data.pages === 0)
                    data.pages = 1;

                data.page = options.page + 1;
                callback(null, data);
            });
    });
};

UserService.prototype.getOneInvitee = function(options, callback) {
    if (!options._id || !options.inviteeId) {
        callback('_id or inviteeId required');
        return;
    }

    UserModel.findOne({inviter: options._id, id:options.inviteeId})
        .populate({path: 'address.province', select: ' -__v'})
        .populate({path: 'address.city', select: ' -__v'})
        .populate({path: 'address.county', select: ' -__v'})
        .populate({path: 'address.town', select: ' -__v'})
        .exec(function(err, doc) {
        if (err) {
            console.error('User Service getOneInvitee error:', err);
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

    // UseOrdersNumberModel.find({userId:{$in:invitees}}).sort({dateUpdated:-1}).lean().exec(function (err, docs) {
    UseOrdersNumberModel.collection.find({userId:{$in:invitees}}).sort({dateUpdated:-1}).toArray(function (err, docs) {
        if (err) {
            console.error('User Service emptyInviteeOrderNumber findOne err:', err);
            callback(null, []);
            return;
        }
        callback(null, docs);
    });
};

// empty the invitee order number by inviter
UserService.prototype.emptyInviteeOrderNumber = function(options, callback) {

    if (!options.inviteeId) {
        console.error('User Service emptyInviteeOrderNumber err: no inviteeId');
        return;
    }

    UseOrdersNumberModel.findOne({userId:options.inviteeId}, function (err, doc) {
        if (err) {
            console.error('User Service emptyInviteeOrderNumber findOne err:', err);
            return;
        }
        if (doc) {
            UseOrdersNumberModel.update({userId:doc.userId}, {$set:{numberForInviter:0, dateUpdated: new Date()}}, function(err, count) {
                // Record not exists
                if (err) {
                    console.error('User Service emptyInviteeOrderNumber update err:', err);
                    return;
                }
                if (count.n === 0) {
                    console.error('User Service emptyInviteeOrderNumber update not find doc');
                }
            });
        }
    });
};

// check user in user white list
UserService.prototype.inWhiteList = function(options, callback) {
    if (!options.userid) {
        callback('User inWhiteList err: no userid');
        return;
    }

    var query = {userId: options.userid};
    UserWhiteListModel.findOne(query, function (err, user) {
        if (err) {
            console.error('User Service get white list user error:', err);
            callback('获取白名单用户失败');
            return;
        }

        // Returns response
        return callback(null, user);
    });
};

UserService.prototype.isXXNRAgent = function(user, callback){
    if(!user){
        callback('user required');
        return;
    }

    UserModel.findById(user._id, function(err, user){
        if(err){
            console.error('User Service isXXNRAgent findById err:', err);
            callback(err);
            return;
        }

        var isXXNRAgent = tools.isXXNRAgent(user.typeVerified);

        callback(null, isXXNRAgent);
    })
};

UserService.prototype.isRSC = function(user, callback){
    if(!user){
        callback('user required');
        return;
    }

    UserModel.findById(user._id, function(err, user){
        if(err){
            console.error('User Service isRSC findById err:', err);
            callback(err);
            return;
        }

        var isXXNRAgent = tools.isRSC(user.typeVerified);

        callback(null, isXXNRAgent);
    })
};

UserService.prototype.getRSCInfoById = function(_id, callback){
    if(!_id){
        callback('need _id');
        return;
    }

    UserModel.findById(_id)
        .populate({path: 'RSCInfo.companyAddress.province', select: ' -__v'})
        .populate({path: 'RSCInfo.companyAddress.city', select: ' -__v'})
        .populate({path: 'RSCInfo.companyAddress.county', select: ' -__v'})
        .populate({path: 'RSCInfo.companyAddress.town', select: ' -__v'})
        .populate({path:'RSCInfo.products', select:' _id category brand name'})
        .select('-_id id account RSCInfo')
        .exec(function(err, user){
            if(err){
                console.error('User Service getRSCInfoById findById err:', err);
                callback('error find user');
                return;
            }

            if(!user){
                callback('user not find');
                return;
            }

            callback(null, user);
        });
};

/**
 * get RSCInfo By RSC's EPOS number
 * @param  {[String]}   EPOSNo   RSC EPOS number
 * @param  {Function}  callback return RSC info
 */
UserService.prototype.getRSCInfoByEPOSNo = function(EPOSNo, callback){
    if(!EPOSNo){
        callback('need EPOSNo');
        return;
    }
    var query = {'RSCInfo.supportEPOS': true, 'RSCInfo.EPOSNo': EPOSNo};
    UserModel.findOne(query)
        .select('_id id account RSCInfo')
        .exec(function(err, rsc){
            if(err){
                console.error('User Service getRSCInfoByEPOSNo findOne err:', err);
                callback('error find RSC');
                return;
            }
            callback(null, rsc);
        });
};

/**
 * get user info by account(phone), with inviter populated by default
 * @param account
 * @param callback
 */
UserService.prototype.getByAccount = function(account, callback){
    if(!account){
        callback('account required');
        return;
    }

    UserModel.findOne({account:account})
        .populate({path:'inviter', select: 'id account photo nickname name'})
        .exec(function(err, user){
        if(err){
            console.error('User Service getByAccount findOne err:', err);
            callback(err);
            return;
        }

        if(!user){
            callback('no user found');
            return;
        }

        callback(null, user);
    })
};

UserService.prototype.getById = function(_id, callback){
    if(!_id){
        callback('need _id');
        return;
    }

    UserModel.findById(_id, function(err, user){
        if(err){
            console.error('User Service getById findById err:', err);
            callback('error find user');
            return;
        }

        if(!user){
            callback('user not found');
            return;
        }

        callback(null, user.toObject());
    })
};

// user consignee info
// save user consignee (user input new consignee when choose the RSC)
UserService.prototype.saveUserConsignee = function(options, callback){
    if (!options || !options.userId || !options.consigneeName || !options.consigneePhone) {
        callback('参数不足');
        return;
    }

    var query = {userId: options.userId, consigneeName: options.consigneeName, consigneePhone: options.consigneePhone};
    UserConsigneeModel.findOne(query, function(err, data){
        if(err){
            console.error('User Service saveUserConsignee findOne err:', err);
            callback('UserConsigneeModel find err');
            return;
        }

        if(data){
            callback('User consignee had in', data);
            return;
        }

        var userConsignee = new UserConsigneeModel(options);
        userConsignee.save(function(err) {
            if(err){
                console.error('User Service saveUserConsignee save err:', err);
                callback('UserConsigneeModel save err');
                return;
            }
            callback(null, userConsignee); 
        });
    });
};

// query user consignee
UserService.prototype.queryUserConsignee = function(options, callback){
    // options.page {String or Number}
    // options.max {String or Number}
    // options.userId

    options.page = U.parseInt(options.page) - 1;
    options.max = U.parseInt(options.max, 20);

    if (options.page < 0)
        options.page = 0;

    if (options.max > 50)
        options.max = 50;


    var take = U.parseInt(options.max);
    var skip = U.parseInt(options.page * options.max);

    var mongoOptions = {};
    
    // userId
    if (options.userId) {
        mongoOptions.userId = options.userId;
    }

    UserConsigneeModel.count(mongoOptions, function (err, count) {
        if (err) {
            callback(err);
            return;
        }
        UserConsigneeModel.find(mongoOptions).sort({dateCreated:-1}).skip(skip).limit(take).lean().select('-_id -__v').exec(function(err, docs) {
            if (err) {
                callback(err);
                return;
            }
            count = count || docs.length;
            var data = {};

            data.count = count;
            data.items = docs;

            // Gets page count
            data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);

            if (data.pages === 0)
                data.pages = 1;

            data.page = options.page + 1;

            // Returns data
            callback(null, data);
        });
    });
};

// user RSC info
// save user RSC (user choose a new RSC to delivery)
UserService.prototype.saveUserRSC = function(options, callback){
    if (!options || !options.userId || !options.RSCId) {
        callback('参数不足');
        return;
    }

    var userRSCOptions = {userId: options.userId, RSC: options.RSCId};
    UserRSCModel.findOne(userRSCOptions, function(err, data){
        if(err){
            console.error('User Service saveUserRSC findOne err:', err);
            callback('UserRSCModel find err');
            return;
        }

        if(data){
            callback('User RSC had in', data);
            return;
        }

        var userRSC = new UserRSCModel(userRSCOptions);
        userRSC.save(function(err) {
            if(err){
                console.error('User Service saveUserRSC save err:', err);
                callback('UserRSCModel save err');
                return;
            }
            callback(null, userRSC);
        });
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

    const isVerified = "this.typeVerified && this.typeVerified.indexOf(this.type) != -1 ";
    if(options.query){
        switch(U.parseInt(options.query)){
            //case 1:
            //    // 未认证
            //    query.$where = '!this.typeVerified || this.typeVerified.length < 1';
            //    break;
//            case 2:
//                // 已认证
//                self.query.query = "this.typeVerified && this.type === this.typeVerified && this.type !== '1'";
//                break;
            case 3:
                // 申请认证
                query.type = {$ne:'1'};
                query.$where = '!this.typeVerified || this.typeVerified.indexOf(this.type) == -1';
                //self.query.query = "this.type !== '1' && this.typeVerified.indexOf(this.type) == -1 ";
                break;
            case 4:
                // 种植大户
                query.typeVerified = '2';
                break;
            case 5:
                // 村级经销商
                query.typeVerified = '3';
                break;
            case 6:
                // 乡镇经销商
                query.typeVerified = '4';
                break;
            case 7:
                // 县级经销商
                query.typeVerified = '5';
                break;
            case 8:
                // 新农经纪人
                query.typeVerified = '6';
                break;
            default:
                // 全部
                break;
        }
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
            .populate({path:'inviter', select:'-_id id account photo nickname name'})
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

UserService.prototype.getTestAccountList = function(callback) {
    UserModel.find({isTestAccount: true})
        .select('id')
        .lean()
        .exec(function (err, testAccounts) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            var testAccountList = [];
            testAccounts.forEach(function (testAccount) {
                testAccountList.push(testAccount.id);
            });

            callback(null, testAccountList);
        })
};

module.exports = new UserService();
