/**
 * Created by zhouxin on 2016/05/31.
 */
var mongoose = require("mongoose");
var tools = require('../common/tools');
var DELIVERYTYPE =  require('../common/defs').DELIVERYTYPE;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var LOYALTYPOINTSTYPE = require('../common/defs').LOYALTYPOINTSTYPE;
var UserModel = require('../models').user;
var LoyaltyPointsLogsModel = require('../models').loyaltypointslogs;
var RewardshopGiftCategoryModel = require('../models').rewardshopgiftcategory;
var RewardshopGiftModel = require('../models').rewardshopgift;
var RewardshopGiftOrderModel = require('../models').rewardshopgiftorder;
var moment = require('moment-timezone');

// Service
LoyaltyPointsService = function() {};

// Method
// create new rewardsshop gift category
LoyaltyPointsService.prototype.createRewardshopGiftCategory = function(categoryName, callback) {
	if (!categoryName) {
		callback('请填写类目名称');
		return;
	}
	RewardshopGiftCategoryModel.findOne({name:categoryName}, function(err, category) {
    	if (err) {
    		console.error('LoyaltyPointsService createRewardshopGiftCategory findOne err:', err);
    		callback('LoyaltyPointsService createRewardshopGiftCategory findOne err');
    		return;
    	}
    	if (category) {
    		callback('添加的类目已存在');
    		return;
    	}
		var category = {};
		category.name = categoryName;
		var categoryObj = new RewardshopGiftCategoryModel(category);
	    categoryObj.save(function(err) {
	        if (err) {
	        	console.error('LoyaltyPointsService createRewardshopGiftCategory save err:', err, 'categoryName:', categoryName);
	        	callback('LoyaltyPointsService createRewardshopGiftCategory save err');
	        	return;
	        }
	        callback(null, categoryObj);
	        return;
	    });
	});
};

// get rewardsshop gift category
LoyaltyPointsService.prototype.getRewardshopGiftCategory = function(_id, categoryName, callback) {
	var query = null;
    if (_id) {
        query = {_id:_id};
    }
    if (categoryName) {
    	if (query) {
    		query.name = categoryName;
    	} else {
    		query = {name:categoryName};
    	}
    }
    if (query) {
        RewardshopGiftCategoryModel.findOne(query)
        	.lean()
            .exec(function (err, category) {
            	if (err) {
		    		console.error('LoyaltyPointsService getRewardshopGiftCategory findOne err:', err);
		    		callback('LoyaltyPointsService getRewardshopGiftCategory findOne err');
		    		return;
		    	}

                callback(null, category);
            });
    } else {
        callback('need query params', null);
    }
};

// query rewardsshop gift categories
LoyaltyPointsService.prototype.queryRewardshopGiftCategories = function(search, callback) {
	var query = {};
	// Prepares searching
    if (search) {
        query.$or = [{'name':new RegExp(search)}];
    }
    RewardshopGiftCategoryModel.find(query)
        .sort({datecreated: 1})
        .select('-__v')
        .lean()
        .exec(function(err, docs) {
        if (err) {
        	console.error('LoyaltyPointsService queryRewardshopGiftCategories RewardshopGiftCategoryModel find err:', err);
            callback('LoyaltyPointsService queryRewardshopGiftCategories RewardshopGiftCategoryModel find err');
            return;
        }

		// Returns data
		callback(null, docs);
	});
};

// create rewardsshop gift
LoyaltyPointsService.prototype.createRewardshopGift = function(giftInfo, callback) {
	if (!giftInfo) {
		callback('请填写礼品信息');
		return;
	}
	var gift = {};
	gift.id = giftInfo.id ? giftInfo.id : U.GUID(10);
	if (giftInfo.category) {
		gift.category = {};
		gift.category.ref = giftInfo.category;
	}
	if (giftInfo.name) {
		gift.name = giftInfo.name;
	}
	if (giftInfo.pictures) {
		gift.pictures = giftInfo.pictures;
	}
	if (giftInfo.appbody) {
		gift.appbody = giftInfo.appbody;
	}
	if (giftInfo.appexchangeProcess) {
		gift.exchangeProcess = giftInfo.appexchangeProcess;
	}
	if (giftInfo.appintroduction) {
		gift.appintroduction = giftInfo.appintroduction;
	}
	if (giftInfo.marketPrice) {
		gift.marketPrice = giftInfo.marketPrice;
	}
	if (typeof giftInfo.istop != 'undefined') {
		gift.istop = giftInfo.istop;
	}
	if (typeof giftInfo.online != 'undefined') {
		gift.online = giftInfo.online;
	}
	if (typeof giftInfo.soldout != 'undefined') {
		gift.soldout = giftInfo.soldout;
	}
	if (giftInfo.points) {
		gift.points = giftInfo.points;
	}
	
    RewardshopGiftModel.findOne({name:giftInfo.name}, function(err, giftDoc) {
    	if (err) {
    		console.error('LoyaltyPointsService createRewardshopGift findOne err:', err);
    		callback('LoyaltyPointsService createRewardshopGift findOne err');
    		return;
    	}
    	if (giftDoc) {
    		callback('新添加的礼品已存在');
    		return;
    	}
    	var giftObj = new RewardshopGiftModel(gift);
    	giftObj.save(function(err) {
	        if (err) {
	        	console.error('LoyaltyPointsService createRewardshopGift save err:', err, 'gift:', gift);
	        	callback('LoyaltyPointsService createRewardshopGift save err');
	        	return;
	        }
	        callback(null, giftObj);
	        return;
	    });
    });
};

// update rewardsshop gift
LoyaltyPointsService.prototype.updateRewardshopGift = function(giftInfo, callback) {
	if (!giftInfo) {
		callback('请填写礼品信息');
		return;
	}
	if (!giftInfo._id) {
		callback('请填写礼品ID');
		return;
	}
	var values = {};
	if (giftInfo.category) {
		values['category.ref'] = giftInfo.category;
	}
	if (giftInfo.name) {
		values.name = giftInfo.name;
	}
	if (giftInfo.pictures) {
		values.pictures = giftInfo.pictures;
	}
	if (giftInfo.appbody) {
		values.appbody = giftInfo.appbody;
	}
	if (giftInfo.appexchangeProcess) {
		values.appexchangeProcess = giftInfo.appexchangeProcess;
	}
	if (giftInfo.appintroduction) {
		values.appintroduction = giftInfo.appintroduction;
	}
	if (typeof giftInfo.marketPrice != 'undefined') {
		values.marketPrice = giftInfo.marketPrice;
	}
	if (typeof giftInfo.istop != 'undefined') {
		values.istop = giftInfo.istop;
	}
	if (typeof giftInfo.online != 'undefined') {
		values.online = giftInfo.online;
	}
	if (typeof giftInfo.soldout != 'undefined') {
		values.soldout = giftInfo.soldout;
	}
	if (giftInfo.points) {
		values.points = giftInfo.points;
	}
	
    if (!U.isEmpty(values)) {
    	RewardshopGiftModel.update({_id:giftInfo._id}, {$set: values}, function(err, numAffected) {
            if (err) {
            	console.error('LoyaltyPointsService updateRewardshopGift update err:', err, 'values:', options);
            	callback('LoyaltyPointsService updateRewardshopGift update err');
            	return;
            }
            callback(null, giftInfo);
            return;
        });
    }
};

// query rewardsshop gifts
LoyaltyPointsService.prototype.queryRewardshopGifts = function(page, max, type, category, search, callback) {

	page = U.parseInt(page);
	max = U.parseInt(max, 20);

	if (page < 0)
		page = 0;
	if (max > 50)
        max = 50;

	var take = U.parseInt(max);
	var skip = U.parseInt(page * max);

	var query = {};
	if (type) {
		switch(parseInt(type)) {
			case 1: 	// 已上线
				query['online'] = true;
				break;
			case 2: 	// 已下线
				query['online'] = false;
				break;
			case 3: 	// 已售罄
				query['soldout'] = true;
				break;
			default:
				break;
		}
	}
    if (category) {
    	query['category.ref'] = category;
    }

	// Prepares searching
    if (search) {
        query.$or = [{'name':new RegExp(search)}];
    }


	RewardshopGiftModel.count(query, function (err, count) {
        if (err) {
        	console.error('LoyaltyPointsService queryRewardshopGifts RewardshopGiftModel count err:', err);
            callback('LoyaltyPointsService queryRewardshopGifts RewardshopGiftModel count err');
            return;
        }
        RewardshopGiftModel.find(query)
	        .sort({istop:-1, datecreated:-1})
	        .skip(skip)
	        .limit(take)
	        .populate({path:'category.ref', select:'name'})
	        .select('-__v')
	        .lean()
	        .exec(function(err, docs) {
	        if (err) {
	            console.error('LoyaltyPointsService queryRewardshopGifts RewardshopGiftModel find err:', err);
	            callback('LoyaltyPointsService queryRewardshopGifts RewardshopGiftModel find err');
	            return;
	        }
			var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);

			// Returns data
			callback(null, docs || [], count, pageCount);
		});
	});
};

// get rewardshop gift
LoyaltyPointsService.prototype.getRewardshopGift = function(id, _id, name, callback) {
	var query = null;
	if (id) {
		query = {id:id};
	}
    if (_id) {
    	if (query) {
        	query._id = _id;
        } else {
    		query = {_id:_id};
    	}
    }
    if (name) {
    	if (query) {
    		query.name = name;
    	} else {
    		query = {name:name};
    	}
    }
    if (query) {
        RewardshopGiftModel.findOne(query)
        	.select('-__v')
        	.populate({path:'category.ref', select:'name deliveries'})
        	.lean()
            .exec(function (err, gift) {
                if (err) {
                    console.error('LoyaltyPointsService getRewardshopGift findOne err:', err);
                    callback('LoyaltyPointsService getRewardshopGift findOne err');
                    return;
                }

                callback(null, gift);
            });
    } else {
        callback('need query params', null);
    }
};

// add gift order
LoyaltyPointsService.prototype.addGiftOrder = function(addGiftOptions, callback) {
	var self = this;
    var orders = {};
    var addressInfo = null;
    var RSCInfo = null;
    var gift = addGiftOptions.gift;
    if (!addGiftOptions.user) {
    	callback("用户不存在");
        return;
    }

    if (!gift) {
    	callback("礼品不存在");
        return;
    }

    if (!gift.online) {
    	callback('无法兑换下架礼品');
        return;
    }

    if (gift.soldout) {
    	callback('无法兑换售罄礼品');
        return;
    }

    if (!addGiftOptions.user.score || (addGiftOptions.user.score < gift.points)) {
    	callback('积分不足');
        return;
    }
    // different deliveryType different address
    if (addGiftOptions.deliveryType && addGiftOptions.deliveryType === DELIVERYTYPE['SONGHUO'].id) {
    	if (!addGiftOptions.addressInfo) {
            callback("请先填写收货地址");
            return;
        }
    } else if (addGiftOptions.deliveryType && addGiftOptions.deliveryType === DELIVERYTYPE['ZITI'].id) {
    	if (!addGiftOptions.consigneeName) {
            callback("请先填写收货人姓名");
            return;
        }
        if (!addGiftOptions.consigneePhone) {
            callback("请先填写收货人手机号");
            return;
        }
        if (!addGiftOptions.RSCInfo || !addGiftOptions.RSCId) {
            callback("请先选择自提点");
            return;
        }
    } else {
        callback("请先选择正确的配送方式");
        return;
    }

    var giftOrder = {
    	"id":U.GUID(10),
		"buyerName":addGiftOptions.user.name,
        "buyerPhone":addGiftOptions.user.account,
        "buyerId":addGiftOptions.user.id,
        "deliverStatus":DELIVERSTATUS.UNDELIVERED,
        "deliveryCode":tools.generateAuthCode(7)
    };
    if (addGiftOptions.deliveryType === DELIVERYTYPE['ZITI'].id) {
    	giftOrder.RSCInfo = addGiftOptions.RSCInfo;
    	giftOrder.consigneeName = addGiftOptions.consigneeName;
        giftOrder.consigneePhone = addGiftOptions.consigneePhone;
        giftOrder.deliveryType = DELIVERYTYPE['ZITI'].id;
    } else {
    	giftOrder.consigneeName = addGiftOptions.addressInfo.consigneeName;
        giftOrder.consigneePhone = addGiftOptions.addressInfo.consigneePhone;
        giftOrder.consigneeAddress = addGiftOptions.addressInfo.consigneeAddress;
        giftOrder.deliveryType = DELIVERYTYPE['SONGHUO'].id;
    }
    var giftInfo = self.convertGift(gift);
    giftOrder.gift = {
    	'ref': giftInfo._id,
    	'id': giftInfo.id,
    	'name': giftInfo.name,
    	'category': giftInfo.category.name,
    	'thumbnail': giftInfo.thumbnail,
    	'points': giftInfo.points,
    	'marketPrice': giftInfo.marketPrice,
		'online': giftInfo.online,
		'soldout': giftInfo.soldout
    };
    giftOrder.points = giftInfo.points;
    // save and increase points
    var giftOrderObj = new RewardshopGiftOrderModel(giftOrder);
    giftOrderObj.save(function(err) {
        if (err) {
            console.error('LoyaltyPointsService addGiftOrder save err:', err, 'giftOrderObj:', giftOrderObj);
            callback('LoyaltyPointsService addGiftOrder save err');
            return;
        }
        self.increase(addGiftOptions.user._id, -giftInfo.points, 'EXCHANGE', giftInfo.name, giftOrderObj._id, function(err, points) {
            if (err) {
                console.error('LoyaltyPointsService addGiftOrder increase err:', err);
                callback('LoyaltyPointsService addGiftOrder increase err');
                RewardshopGiftOrderModel.findOne({_id:giftOrderObj._id}).remove(function(err) {
                    if (err) {
                        // rollback fail, don't know how to handle it, log to console
                        console.error('LoyaltyPointsService RewardshopGiftOrderModel document rollback fail, err:', err, 'giftOrderObj:', giftOrderObj);
                    }
                });
                return;
            }
            callback(null, giftOrderObj);
        });
    });
}

// get gift order
LoyaltyPointsService.prototype.getGiftOrder = function(id, userId, callback) {
    var self = this;
    var query = {id: id};
    if (userId) {
        query.buyerId = userId;
    }
    RewardshopGiftOrderModel.findOne(query, function (err, giftOrder) {
        if (err) {
            console.error('LoyaltyPointsService getGiftOrder findOne err:', err);
            callback('LoyaltyPointsService getGiftOrder findOne err');
            return;
        }
        callback(null, giftOrder);
    });
};

// update gift order
LoyaltyPointsService.prototype.updateGiftOrder = function(id, userId, deliverStatus, RSCInfo, options, callback) {
    var self = this;
    var query = {id: id};
    if (userId) {
        query.buyerId = userId;
    }
    RewardshopGiftOrderModel.findOne(query, function (err, giftOrder) {
        if (err) {
            console.error('LoyaltyPointsService updateGiftOrder findOne err:', err);
            callback('LoyaltyPointsService updateGiftOrder findOne err');
            return;
        }
        if (giftOrder) {
            if (deliverStatus && giftOrder.deliverStatus !== deliverStatus) {
                giftOrder.deliverStatus = deliverStatus;
                if (giftOrder.deliverStatus === DELIVERSTATUS.DELIVERED) {
                    giftOrder.dateDelivered = new Date();
                }
                if (giftOrder.deliverStatus === DELIVERSTATUS.RECEIVED) {
                    if (giftOrder.deliveryType === DELIVERYTYPE['ZITI'].id) {
                        giftOrder.dateDelivered = new Date();
                    }
                    giftOrder.dateCompleted = new Date();
                }
                if (options.backendUser) {
                    giftOrder.dateSet = new Date();
                    giftOrder.backendUser = options.backendUser._id;
                    giftOrder.backendUserAccount = options.backendUser.account;
                }
            }
            if (RSCInfo) {
                giftOrder.RSCInfo.RSC = RSCInfo.RSC;
                giftOrder.RSCInfo.RSCAddress = RSCInfo.RSCAddress ? RSCInfo.RSCAddress : '';
                giftOrder.RSCInfo.companyName = RSCInfo.companyName ? RSCInfo.companyName : '';
                giftOrder.RSCInfo.RSCPhone = RSCInfo.RSCPhone ? RSCInfo.companyName : '';
                if (options.backendUser) {
                    giftOrder.RSCInfo.dateSet = new Date();
                    giftOrder.RSCInfo.backendUser = options.backendUser._id;
                    giftOrder.RSCInfo.backendUserAccount = options.backendUser.account;
                }
            }
            // save
            giftOrder.save(function(err) {
                if (err) {
                    console.error('LoyaltyPointsService updateGiftOrder save err:', err);
                    callback('LoyaltyPointsService updateGiftOrder save err');
                    return;
                }

                callback(null, giftOrder);
            });
        } else {
            callback('not find giftOrder');
        }
    });
}

// increase
/**
 * LoyaltyPoints increase function
 * @param  {String}   user_id     user _id
 * @param  {Number}   points      points of increase
 * @param  {String}   type        the type of loyalty points increase
 * @param  {String}   description description of loyalty points increase
 * @param  {String}   ref_id 	  the ref _id (compaign _id, order _id and so on)
 * @param  {Function} callback    the callback function
 * @param  {Object}   obj         the point increase object (user and so on)
 * @return
 */
LoyaltyPointsService.prototype.increase = function(user_id, points, type, description, ref_id, callback, obj) {
	var self = this;
	if (!user_id) {
        callback('user required');
        return;
    }

    if (!points) {
        callback('points required');
        return;
    }

    var returnOptions = {};
    var values = {};
    // user sign points logic
    if (type && type =='SIGN') {
    	var beijingTimeNow = moment().tz('Asia/Shanghai');
    	var consecutiveTimes = 1;
    	var maxTimes = 5;
    	var sign = {date:beijingTimeNow.format('YYYY-MM-DD HH:mm:ss')};
        var user = obj;
    	if (user && user.sign && user.sign.date) {
			var nowDate = moment(beijingTimeNow).add(-1, 'd').format('YYYY-MM-DD');
			if (nowDate == moment(user.sign.date).format('YYYY-MM-DD') && user.sign.consecutiveTimes) {
				consecutiveTimes = user.sign.consecutiveTimes + 1;
			}
    	}
    	sign.consecutiveTimes = consecutiveTimes;
        returnOptions.consecutiveTimes = consecutiveTimes;
    	if (consecutiveTimes > 0) {
    		if (consecutiveTimes < maxTimes) {
				points = points * consecutiveTimes;
			} else {
				points = points * maxTimes;
			}
		}
		values.$set = {sign:sign};
        description = '连续签到' + consecutiveTimes + '天';
    }
    values.$inc = {score: parseInt(points)};

    UserModel.update({_id:user_id}, values, function(err, numAffected) {
        if (err) {
            console.error('LoyaltyPointsService increase UserModel update err:', err);
            callback('points increase error');
            return;
        }

        if (numAffected.n == 0) {
            callback('user not find');
            return;
        }

        callback(null, points, returnOptions);
        self.saveLog(user_id, points, type, description, ref_id);
    });
};

// save loyaltypoints logs
LoyaltyPointsService.prototype.saveLog = function(user_id, points, type, description, ref_id) {
	var log = {};
	log.user = user_id;
	log.points = points;
	if (LOYALTYPOINTSTYPE && LOYALTYPOINTSTYPE[type]) {
		log.event = {};
		if (LOYALTYPOINTSTYPE[type].type) {
			log.event.type = LOYALTYPOINTSTYPE[type].type;
		}
		if (LOYALTYPOINTSTYPE[type].name) {
			log.event.name = LOYALTYPOINTSTYPE[type].name;
		}
		if (ref_id && LOYALTYPOINTSTYPE[type].refName) {
			log.event[LOYALTYPOINTSTYPE[type].refName] = ref_id;
		}
	}
	if (description) {
		log.description = description;
	}
	
	var Obj = new LoyaltyPointsLogsModel(log);
    Obj.save(function(err) {
        if (err) {
        	console.error('LoyaltyPointsService saveLog err:', err, 'log info:', log);
        }
    });
};

// query loyaltypoints logs by user
LoyaltyPointsService.prototype.queryLogsbyUser = function(user_id, page, max, callback) {
	if(!user_id) {
        callback('user required');
        return;
    }
    var self = this;
    self.queryLogs(user_id, null, null, page, max, function(err, logs, count, pageCount) {
    	if (err) {
			console.error('LoyaltyPointsService queryLogsbyUser queryLogs err:', err);
			callback('LoyaltyPointsService queryLogsbyUser queryLogs err');
			return;
		}
    	callback(null, logs, count, pageCount);
    });
};

// query loyaltypoints logs
LoyaltyPointsService.prototype.queryLogs = function(user_id, type, times, page, max, callback) {
    var query = {};
    if (user_id)
    	query.user = user_id;
    if (type) {
    	switch(parseInt(type)) {
    		case 1:
    			query.points = {$gt:0};
    			break;
    		case 2:
    			query.points = {$lt:0};
    			break;
    		default:
    			break;

    	}
    }
    if (times && times.length > 0) {
    	if (times.length == 1) {
    		query.date = {$gt:times[0]};
    	} else {
    		query.date = {$gt:times[0], $lt:times[1]};
    	}
    }

	if (page<0 || !page) {
		page = 0;
	}

	if (max<0 || !max) {
		max = 20;
	}

	if (max>50) {
		max = 50;
	}
	LoyaltyPointsLogsModel.count(query, function(err, count) {
		if (err) {
			console.error('LoyaltyPointsService queryLogs count err:', err);
			callback('LoyaltyPointsService queryLogs count err');
			return;
		}
		LoyaltyPointsLogsModel.find(query)
			.select('-_id -__v -event._id')
			.sort({date:-1})
			.skip(page * max)
			.limit(max)
            .populate({path:'user', select:'-_id account name score'})
            .populate({path:'event.gift', select:'-_id name'})
			.lean()
			.exec(function (err, logs) {
				if (err) {
					console.error('LoyaltyPointsService queryLogs find err:', err);
					callback('LoyaltyPointsService queryLogs find err');
					return;
				}
				var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
				callback(null, logs||[], count, pageCount);
		});
	});
}

// gift order status
LoyaltyPointsService.prototype.giftOrderStatus = function (order) {
    /**
     * User order types
     * 1    :   待发货
     * 2    :   配送中
     * 3    :   待自提
     * 4    :   已完成
     */
    if (order.deliverStatus === DELIVERSTATUS.RECEIVED) {
        return {type:4, value:'已完成'};
    } else if(order.deliverStatus === DELIVERSTATUS.DELIVERED) {
        return {type:2, value:'配送中'};
    } else {
        if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
            return {type:3, value:'待自提'};
        } else {
            return {type:1, value:'待发货'};
        }
    }
};

// query gift orders logs
LoyaltyPointsService.prototype.queryGiftOrders = function(buyerId, type, times, search, page, max, callback) {
    var query = {};
    
    if (type) {
        switch(parseInt(type)) {
            case 1:
                query.deliverStatus = { $ne: DELIVERSTATUS.RECEIVED };
                break;
            case 2:
                query.deliverStatus = { $eq: DELIVERSTATUS.RECEIVED };
                break;
            default:
                break;
        }
    }
    if (times && times.length > 0) {
        if (times.length == 1) {
            query.dateCreated = {$gt:times[0]};
        } else {
            query.dateCreated = {$gt:times[0], $lt:times[1]};
        }
    }
    if (search) {
        query.$or = [
            {buyerName: new RegExp('^'+search)},
            {buyerPhone: new RegExp('^'+search)},
            {consigneeName: new RegExp('^'+search)},
            {consigneePhone: new RegExp('^'+search)}
        ];
    }

    if (page<0 || !page) {
        page = 0;
    }

    if (max<0 || !max) {
        max = 20;
    }

    if (max>50) {
        max = 50;
    }

    if (buyerId)
        query.buyerId = buyerId;
    RewardshopGiftOrderModel.count(query, function(err, count) {
        if (err) {
            console.error('LoyaltyPointsService queryGiftOrders count err:', err);
            callback('LoyaltyPointsService queryGiftOrders count err');
            return;
        }
        RewardshopGiftOrderModel.find(query)
            .sort({dateCreated:-1})
            .skip(page * max)
            .limit(max)
            .select('-_id -__v')
            .lean()
            .exec(function (err, logs) {
                if (err) {
                    console.error('LoyaltyPointsService queryGiftOrders find err:', err);
                    callback('LoyaltyPointsService queryGiftOrders find err');
                    return;
                }
                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, logs||[], count, pageCount);
        });
    });
}

LoyaltyPointsService.prototype.convertGift = function(gift) {
	if (gift) {
		if (gift.category && gift.category.ref)
			gift.category = gift.category.ref;
	}
	
	if (gift.pictures) {
		var pictures = [];
	    gift.pictures.forEach(function(pic){
	        var picture = {};
	        picture.largeUrl = '/images/large/' + pic + '.jpg';
	        picture.thumbnail = '/images/thumbnail/' + pic + '.jpg';
	        picture.originalUrl = '/images/original/' + pic + '.jpg';
	        pictures.push(picture);
	    });

	    gift.largeUrl = pictures[0] ? pictures[0].largeUrl : '';
	    gift.thumbnail = pictures[0] ? pictures[0].thumbnail : '';
	    gift.originalUrl = pictures[0] ? pictures[0].originalUrl : '';
	    gift.pictures = pictures;
	}
	return gift;
}

module.exports = new LoyaltyPointsService();