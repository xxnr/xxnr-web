/**
 * Created by pepelu on 2016/1/20.
 */
var IntentionProductModel = require('../models').intention_product;
var PotentialCustomerModel = require('../models').potential_customer;
var UserModel = require('../models').user;
var mongoose = require("mongoose");
var moment = require('moment-timezone');

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

                        if(count >= 15){
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
PotentialCustomerService.prototype.query = function(user, callback){
    var queryOptions = {};
    if(user){
        queryOptions.user = mongoose.Types.ObjectId(user._id);
    }

    PotentialCustomerModel.find(queryOptions, {name:1, phone:1, remarks:1, isRegistered:1, sex:1}, function(err, customers){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, customers);
    })
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
        .select('name phone sex address buyIntentions remarks')
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

module.exports = new PotentialCustomerService();