/**
 * Created by pepelu on 2016/1/20.
 */
var IntentionProductModel = require('../models').intention_product;
var PotentialCustomerModel = require('../models').potential_customer;
var UserModel = require('../models').user;
var mongoose = require("mongoose");
var moment = require('moment-timezone');
const CountPerDay = 15;
var PotentialCustomerService = function(){};

// add potential customer
PotentialCustomerService.prototype.add = function(user, name, phone, sex, address, buyIntentions, remarks, callback) {
    if (!user) {
        callback('user required');
        return;
    }

    if (!name) {
        callback('name required');
        return;
    }

    if (!phone) {
        callback('phone required');
        return;
    }

    if (typeof sex == 'undefined') {
        callback('sex required');
        return;
    }

    if (!address || !address.province || !address.city) {
        callback('province and city required');
        return;
    }

    if (!buyIntentions || buyIntentions.length <= 0) {
        callback('BuyIntention required');
        return;
    }

    var promises = buyIntentions?buyIntentions.map(function (buyIntention) {
        return new Promise(function (resolve, reject) {
            IntentionProductModel.collection.findOne({_id: mongoose.Types.ObjectId(buyIntention)}, function (err, intention) {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                if (!intention) {
                    reject('找不到该意向商品');
                    return;
                }

                resolve();
            })
        })
    }) : [];

    var currentDate = moment().tz('Asia/Shanghai').format('YYYYMMDD');
    var potential_customer = {user:mongoose.Types.ObjectId(user._id), name: name, phone: phone, sex: sex, address: address, dateAdded:currentDate};
    if (buyIntentions) {
        potential_customer.buyIntentions = buyIntentions;
    }

    if (remarks) {
        potential_customer.remarks = remarks;
    }

    Promise.all(promises)
        .then(function () {
            UserModel.collection.findOne({account:phone}, function(err, doc){
                if(err){
                    console.error(err);
                    callback(err);
                    return;
                }

                if(doc){
                    callback('该客户已注册，可让其直接添加您为新农代表，方便您跟踪订单与提供服务');
                    return;
                }

                PotentialCustomerModel.collection.findOne({'phone':phone}, function(err, potentialCustomer){
                    if(err){
                        console.error(err);
                        callback(err);
                        return;
                    }

                    if(potentialCustomer){
                        callback('该客户资料已经登记过');
                        return;
                    }

                    PotentialCustomerModel.collection.count({user:mongoose.Types.ObjectId(user._id), dateAdded:currentDate}, function(err, count){
                        if(err){
                            console.error(err);
                            callback(err);
                            return;
                        }

                        if(count >= CountPerDay){
                            callback('今日名额已用完，请合理报备');
                            return;
                        }

                        var newPotentialCustomer = new PotentialCustomerModel(potential_customer);
                        newPotentialCustomer.save(function(err){
                            if (err) {
                                if(11000 == err.code){
                                    callback('该客户资料已经登记过');
                                    return;
                                }

                                console.error(err);
                                callback(err);
                                return;
                            }

                            callback();
                            if(buyIntentions) {
                                buyIntentions.forEach(function (buyIntention) {
                                    IntentionProductModel.update({_id: mongoose.Types.ObjectId(buyIntention)}, {$inc: {count:1}}, function (err) {
                                        if (err) {
                                            console.error(err);
                                        }
                                    })
                                })
                            }
                        })
                    });
                })
            })
        })
        .catch(function(err){
            callback(err);
        })
};

// query potential customer
PotentialCustomerService.prototype.queryPage = function(user, page, max, callback, search, BESchema){
    var queryOptions = {};
    if(user){
        queryOptions.user = mongoose.Types.ObjectId(user._id);
    }

    if(page<0 || !page){
        page = 0;
    }

    if(max<0 || !max){
        max = 20;
    }

    if(max>50){
        max = 50;
    }

    var querier = function() {
        PotentialCustomerModel.count(queryOptions, function (err, count) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            var query = PotentialCustomerModel.find(queryOptions)
                .skip(page * max)
                .limit(max);
            if(BESchema){
                query = query.populate({path:'user', select:'-_id name typeVerified'})
                    .populate('address.province')
                    .populate('address.city')
                    .populate('address.county')
                    .populate('address.town')
                    .select('name phone remarks isRegistered sex address dateTimeAdded dateTimeRegistered user');
            } else{
                query = query.select('name phone remarks isRegistered sex');
            }

            query.sort({dateTimeAdded:-1})
                .exec(function (err, customers) {
                    if (err) {
                        console.error(err);
                        callback(err);
                        return;
                    }

                    var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                    callback(null, customers, count, pageCount);
                })
        });
    };

    if(search){
        queryOptions['$or'] = [];
        queryOptions['$or'].push({name:{$regex:new RegExp(search)}});
        queryOptions['$or'].push({phone:{$regex:new RegExp(search)}});
        UserModel.find({name:{$regex:new RegExp(search)}}, function(err, users){
            if(users){
                var userIds = [];
                users.forEach(function(user){
                    userIds.push(user._id);
                });

                queryOptions['$or'].push({user:{$in:userIds}});
                querier();
            }
        });
    } else{
        querier();
    }
};

PotentialCustomerService.prototype.countLeftToday = function(user, callback){
    if(!user){
        callback('user required');
        return;
    }

    var currentDate = moment().tz('Asia/Shanghai').format('YYYYMMDD');
    PotentialCustomerModel.count({user:mongoose.Types.ObjectId(user._id), dateAdded:currentDate}, function(err, count){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, CountPerDay-count);
    });
};

PotentialCustomerService.prototype.getById = function(id, callback){
    if(!id){
        callback('id required');
        return;
    }

    PotentialCustomerModel.findById(id)
        .populate({path:'buyIntentions', select:' -__v -count'})
        .populate({path:'address.province', select:'-_id -__v'})
        .populate({path:'address.city', select:'-_id -__v'})
        .populate({path:'address.county', select:'-_id -__v'})
        .populate({path:'address.town', select:'-_id -__v'})
        .populate({path:'user', select:'-_id name'})
        .select('name phone sex address buyIntentions remarks user isRegistered dateTimeRegistered')
        .lean()
        .exec(function(err, doc){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(!doc){
            callback('not found');
            return;
        }

        callback(null, doc);
    })
};

PotentialCustomerService.prototype.isAvailable = function(phone, callback) {
    UserModel.collection.findOne({account: phone}, function (err, doc) {
        if (err) {
            console.error(err);
            callback(err);
            return;
        }

        if (doc) {
            callback(null, false, '该客户已注册，可让其直接添加您为新农代表，方便您跟踪订单与提供服务');
            return;
        }

        PotentialCustomerModel.collection.findOne({'phone': phone}, function (err, potentialCustomer) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            if (potentialCustomer) {
                callback(null, false, '该客户资料已经登记过');
                return;
            }

            callback(null, true);
        });
    });
};

PotentialCustomerService.prototype.getStatistic = function(user, callback){
    PotentialCustomerModel.count({user:user}, function(err, totalCount){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        PotentialCustomerModel.count({user:user, isRegistered:true}, function(err, registeredCount){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, totalCount, registeredCount);
        })
    })
};

module.exports = new PotentialCustomerService();