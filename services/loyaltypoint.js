/**
 * Created by zhouxin on 2016/05/31.
 */
var mongoose = require("mongoose");
var tools = require('../common/tools');
var LOYALTYPOINTSTYPE = require('../common/defs').LOYALTYPOINTSTYPE;
var UserModel = require('../models').user;
var LoyaltyPointsLogsModel = require('../models').loyaltypointslogs;
var RewardshopGiftCategoryModel = require('../models').rewardshopgiftcategory;
var RewardshopGiftModel = require('../models').rewardshopgift;

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
        .sort({datecreated:-1})
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
	if (typeof giftInfo.istop != 'undefinded') {
		gift.istop = giftInfo.istop;
	}
	if (typeof giftInfo.online != 'undefinded') {
		gift.online = giftInfo.online;
	}
	if (typeof giftInfo.soldout != 'undefinded') {
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
	var options = {};
	if (giftInfo.category) {
		options['category.ref'] = giftInfo.category;
	}
	if (giftInfo.name) {
		options.name = giftInfo.name;
	}
	if (giftInfo.pictures) {
		options.pictures = giftInfo.pictures;
	}
	if (giftInfo.appbody) {
		options.appbody = giftInfo.appbody;
	}
	if (giftInfo.appexchangeProcess) {
		options.appexchangeProcess = giftInfo.appexchangeProcess;
	}
	if (giftInfo.appintroduction) {
		options.appintroduction = giftInfo.appintroduction;
	}
	if (giftInfo.marketPrice) {
		options.marketPrice = giftInfo.marketPrice;
	}
	if (typeof giftInfo.istop != 'undefinded') {
		options.istop = giftInfo.istop;
	}
	if (typeof giftInfo.online != 'undefinded') {
		options.online = giftInfo.online;
	}
	if (typeof giftInfo.soldout != 'undefinded') {
		options.soldout = giftInfo.soldout;
	}
	if (giftInfo.points) {
		options.points = giftInfo.points;
	}
	
	RewardshopGiftModel.update({_id:giftInfo._id}, {$set: options}, function(err, numAffected) {
        if (err) {
        	console.error('LoyaltyPointsService updateRewardshopGift update err:', err, 'options:', options);
        	callback('LoyaltyPointsService updateRewardshopGift update err');
        	return;
        }
        callback(null, giftInfo);
        return;
    });
};

// query rewardsshop gifts
LoyaltyPointsService.prototype.queryRewardshopGifts = function(page, max, type, category, search, callback) {

	page = U.parseInt(page) - 1;
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
	        .sort({istop:1, datecreated:-1})
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

// increase
/**
 * LoyaltyPoints increase function
 * @param  {String}   user_id     user _id
 * @param  {Number}   points      points of increase
 * @param  {String}   type        the type of loyalty points increase
 * @param  {String}   description description of loyalty points increase
 * @param  {String}   ref_id 	  the ref _id (compaign _id, order _id and so on)
 * @param  {Function} callback    the callback function
 * @return
 */
LoyaltyPointsService.prototype.increase = function(user_id, points, type, description, ref_id, callback) {
	var self = this;
	if (!user_id) {
        callback('user required');
        return;
    }

    if (!points) {
        callback('points required');
        return;
    }

    UserModel.update({_id:user_id}, {$inc:{score: parseInt(points)}}, function(err, numAffected) {
        if (err) {
            console.error('LoyaltyPointsService increase UserModel update err:', err);
            callback('points increase error');
            return;
        }

        if (numAffected.n == 0) {
            callback('user not find');
            return;
        }

        callback();
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
			.lean()
			.populate({path:'user', select:'-_id account name score'})
			.populate({path:'event.gift', select:'-_id name'})
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

module.exports = new LoyaltyPointsService();