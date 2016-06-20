/**
 * Created by zhouxin on 2016/06/15.
 */
var path = require('path');
var tools = require('../common/tools');
var moment = require('moment-timezone');
var services = require('../services');
var UserService = services.user;
var LoyaltypointService = services.loyaltypoint;
var DELIVERYTYPE =  require('../common/defs').DELIVERYTYPE;

// ==========================================================================
// pionts
// ==========================================================================

// get 
exports.json_rewardshop_get = function(req, res, next) {
    var options = {};

    if (req.data.userId)
        options.userid = req.data.userId;
    options.ip = req.ip;

    UserService.get(options, function (err, user) {
    	// Error
        if (err) {
        	console.error('F.rewardshop json_rewardshop_get UserService get err:', err);
            res.respond({code: 1004, message: '获取用户积分失败'});
            return;
        }
        if (!user) {
			res.respond({code: 1002, message: '获取用户积分失败'});
            return;
        }
        // sign info
        var result = {};
        result.score = user.score;
        result.sign = user.sign;
        result.sign.signed = 0;
        result.sign.consecutiveTimes = user.sign && user.sign.consecutiveTimes ? user.sign.consecutiveTimes: 0;
        if (user.sign && user.sign.date) {
            var beijingTimeNow = moment().tz('Asia/Shanghai');
            var nowDate = moment(beijingTimeNow).format('YYYY-MM-DD');
            var signDate = moment(user.sign.date).format('YYYY-MM-DD');
            var yesterday = moment(beijingTimeNow).add(-1, 'd').format('YYYY-MM-DD');
            if (nowDate == signDate) {
                result.sign.signed = 1;
            } else {
                if (yesterday !== signDate) {
                    result.sign.consecutiveTimes = 0;
                }
            }
        } else {
            result.sign.consecutiveTimes = 0;
        }
        // sign img url
        result.sign.small_imgUrl = '/images/rewardshop/sign/small/default.png';
        result.sign.large_imgUrl = '/images/rewardshop/sign/large/default.png';
        if (result.sign.consecutiveTimes) {
            var filename = 'default.png';
            switch(true) {
                case parseInt(result.sign.consecutiveTimes) == 1:
                    filename = 'one.png';
                    break;
                case parseInt(result.sign.consecutiveTimes) == 2:
                    filename = 'two.png';
                    break;
                case parseInt(result.sign.consecutiveTimes) == 3:
                    filename = 'three.png';
                    break;
                case parseInt(result.sign.consecutiveTimes) == 4:
                    filename = 'four.png';
                    break;
                case parseInt(result.sign.consecutiveTimes) >= 5:
                    filename = 'five.png';
                    break;
            }
            result.sign.small_imgUrl = '/images/rewardshop/sign/small/' + filename;
            result.sign.large_imgUrl = '/images/rewardshop/sign/large/' + filename;
        }
        res.respond({code: 1000, message: 'success', datas: result});
    });
}

// get pionts logs
exports.json_rewardshop_pointslogs = function(req, res, next) {
	var self = this;
	var page = U.parseInt(req.data.page, 1) - 1;
	var max = U.parseInt(req.data.max, 20);
	var options = {};
	if (req.data.userId)
        options.userid = req.data.userId;

    UserService.get(options, function (err, user) {
    	// Error
        if (err) {
        	console.error('F.rewardshop json_rewardshop_get UserService get err:', err);
            res.respond({code: 1004, message: '获取积分历史列表失败'});
            return;
        }
        if (!user) {
			res.respond({code: 1002, message: '没有查找到用户，获取积分历史列表失败'});
            return;
        }
		LoyaltypointService.queryLogs(user._id, null, null, page, max, function(err, pointslogs, count, pageCount) {
			if (err) {
				res.respond({code:1002, message:'获取积分历史列表失败'});
				return;
			}

			var resultPointslogs = [];
			pointslogs.forEach(function(pointslog) {
				delete pointslog.user;
				resultPointslogs.push(pointslog);
			});

			res.respond({code:1000, message:'success', datas:{pointslogs:resultPointslogs, total:count, pages:pageCount, page:page}});
		});
	});
}

exports.add_gift_order = function(req, res, next){
    var data = req.data;
    var userId = data['userId'];
    var addressId = data['addressId'];
    var giftId = data['giftId'] || [];
    var deliveryType = data['deliveryType'] || DELIVERYTYPE['SONGHUO'].id;
    var RSCId = data['RSCId'] || null;
    var consigneePhone = data['consigneePhone'] || null;
    var consigneeName = data['consigneeName'] || null;

    if (deliveryType && deliveryType === DELIVERYTYPE['SONGHUO'].id) {
        if (!addressId) {
            res.respond({"code":1001, "message":"请先填写收货地址"});
            return;
        }
    } else if (deliveryType && deliveryType === DELIVERYTYPE['ZITI'].id) {
        if (!RSCId) {
            res.respond({"code":1001, "message":"请先选择自提点"});
            return;
        }
        if (!consigneePhone || !tools.isPhone(consigneePhone)) {
            res.respond({"code":1001, "message":"请先填写正确的收货人手机号"});
            return;
        }
        if (!consigneeName) {
            res.respond({"code":1001, "message":"请先填写收货人姓名"});
            return;
        }
    } else {
        res.respond({"code":1001, "message":"请先选择正确的配送方式"});
        return;
    }

    console.log(userId);
    UserService.get({"userid":userId}, function(err, user) {
        if (err || !user) {
            res.respond({code:1001, message:'用户不存在'});
            return;
        }

        LoyaltypointService.getRewardshopGift(giftId, null, null, function(err, gift) {
            if (err || !gift) {
                res.respond({code:1001, message:'礼品不存在'});
                return;
            }

            if (!gift.online) {
            	res.respond({code:1001, message:'无法兑换下架礼品'});
                return;
            }

            if (gift.soldout) {
            	res.respond({code:1001, message:'无法兑换售罄礼品'});
                return;
            }

            if (!user.score || (user.score < gift.points)) {
            	res.respond({code:1001, message:'积分不足'});
                return;
            }

            if (deliveryType && deliveryType === DELIVERYTYPE['SONGHUO'].id) {
                UseraddressService.get({"id": addressId}, function(err, address) {
                    if(err || !address){
                        res.respond({code:1001, message:'收货地址不存在'});
                        return;
                    }
                    var addOrderOptions = {};
                    addOrderOptions.user = user;
                    addOrderOptions.gift = gift;
                    addOrderOptions.deliveryType = deliveryType;
                    // addOrderOptions.address = address;

                    addOrderOptions.addressInfo = {
                        "consigneeName": address.receiptpeople,
                        "consigneePhone": address.receiptphone,
                        "consigneeAddress": address.provincename + address.cityname + (address.countyname || '') + (address.townname || '') + address.address
                    };
                    LoyaltypointService.addGiftOrder(addOrderOptions, function(err, response) {
                        if(err || !response){
                            res.respond({code:1001, message:err});
                            return;
                        }
                        res.respond(response);
                    });
                });
            } else if (deliveryType && deliveryType === DELIVERYTYPE['ZITI'].id) {
                UserService.getRSCInfoById(RSCId, function(err, RSC) {
                    if(err || !RSC){
                        res.respond({code:1001, message:'自提点不存在'});
                        return;
                    }
                    if (!RSC.RSCInfo || !RSC.RSCInfo.companyAddress || !RSC.RSCInfo.companyAddress.province.name || !RSC.RSCInfo.companyAddress.city.name) {
                        callback("自提点地址不完整");
                        return;
                    }
                    var addOrderOptions = {};
                    addOrderOptions.user = user;
                    addOrderOptions.gift = gift;
                    addOrderOptions.deliveryType = deliveryType;
                    addOrderOptions.RSCId = RSCId;
                    addOrderOptions.consigneeName = consigneeName;
                    addOrderOptions.consigneePhone = consigneePhone;

                    addOrderOptions.RSCInfo = {RSC: RSCId};
                    addOrderOptions.RSCInfo.RSCAddress = RSC.RSCInfo.companyAddress.province.name + RSC.RSCInfo.companyAddress.city.name;
                    if (RSC.RSCInfo.companyAddress.county && RSC.RSCInfo.companyAddress.county.name) {
                        addOrderOptions.RSCInfo.RSCAddress += RSC.RSCInfo.companyAddress.county.name;
                    }
                    if (RSC.RSCInfo.companyAddress.town && RSC.RSCInfo.companyAddress.town.name) {
                        addOrderOptions.RSCInfo.RSCAddress += RSC.RSCInfo.companyAddress.town.name;
                    }
                    if (RSC.RSCInfo.companyAddress.details) {
                        addOrderOptions.RSCInfo.RSCAddress += RSC.RSCInfo.companyAddress.details;
                    }
                    if (RSC.RSCInfo.companyName) {
                        addOrderOptions.RSCInfo.companyName = RSC.RSCInfo.companyName;
                    }
                    if (RSC.RSCInfo.phone) {
                        addOrderOptions.RSCInfo.RSCPhone = RSC.RSCInfo.phone;
                    }
                    LoyaltypointService.addGiftOrder(addOrderOptions, function(err, response) {
                        if(err || !response){
                            res.respond({code:1001, message:'兑换礼品失败'});
                            return;
                        }
                        res.respond({code:1000, message:'success', giftOrder:response});
                        // save user input consignee and chose RSC
                        var userConsignee = {userId: user.id, consigneeName: consigneeName, consigneePhone: consigneePhone};
                        UserService.saveUserConsignee(userConsignee, function(err){});
                        var userRSC = {userId: user.id, RSCId: RSCId};
                        UserService.saveUserRSC(userRSC, function(err){});
                    });
                });
            } else {
                res.respond({"code":1001, "message":"请先选择配送方式"});
                return;
            }
        });
    });
};

// ==========================================================================
// rewardshop gift
// ==========================================================================

// get categories
exports.json_rewardshop_categories = function(req, res, next) {
	LoyaltypointService.queryRewardshopGiftCategories(null, function(err, categories) {
		if (err) {
			res.respond({code:1002, message:'获取礼品类目失败'});
			return;
		}

		res.respond({code:1000, message:'success', categories:categories});
	});
}

// get online gift list by category or other conditions
exports.json_rewardshop_gifts = function(req, res, next) {
	var page = U.parseInt(req.data.page, 1) - 1;
	var max = U.parseInt(req.data.max, 20);
	var type = 1; // only online
	LoyaltypointService.queryRewardshopGifts(page, max, type, req.data.category, req.data.search, function(err, gifts, count, pageCount) {
		if (err) {
			res.respond({code:1002, message:'获取礼品列表失败'});
			return;
		}

		var resultGifts = [];
		gifts.forEach(function(gift){
			delete gift._id;
			delete gift.appbody;
			resultGifts.push(LoyaltypointService.convertGift(gift));
		});
		res.respond({code:1000, message:'success', datas:{gifts:resultGifts, total:count, pages:pageCount, page:page}});
	});
}

// get online gift detail
exports.json_rewardshop_giftDetail = function(req, res, next) {
	var host = req.hostname;
    var prevurl = 'http://' + host + '/gift/';
	LoyaltypointService.getRewardshopGift(req.data.id, null, null, function(err, gift) {
		if (err || !gift) {
			res.respond({code:1002, message:'获取礼品详情失败'});
			return;
		}

		if (gift.appbody && gift.appbody !== '') {
            gift.appbody_url = prevurl + 'appbody/' + gift.id;
            delete gift.appbody;
		} else {
            gift.appbody_url = '';
		}
        
		res.respond({code:1000, message:'success', gift: LoyaltypointService.convertGift(gift)});
	});
}

// ==========================================================================
// rewardshop views
// ==========================================================================

// get gift info page
exports.view_gift_info = function (req, res, next) {
    var giftInfo = req.params.giftInfo;
    LoyaltypointService.getRewardshopGift(req.params.giftId, null, null, function(err, gift) {
        if (err || !gift) {
            res.status(404).send('404: Page not found');
            return;
        }
        var result = {};
        if (giftInfo && gift[giftInfo]) {
            if (giftInfo === "appbody") {
                result.title = '商品详情' + (gift.name ? (' - ' + gift.name) : '');
            }
            result.productInfo = gift[giftInfo];
        } else {
            res.status(404).send('404: Page not found');
            return;
        }

        res.render(path.join(__dirname, '../views/4.api-v1.0/productInfoAppTemplate'),
            {
                result: result
            }
        );
    });
};