/**
 * Created by zhouxin on 2016/06/15.
 */
var path = require('path');
var tools = require('../common/tools');
var moment = require('moment-timezone');
var services = require('../services');
var UserService = services.user;
var UseraddressService = services.useraddress;
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
    options.ip = req.clientIp;

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
        result.sign = {};
        if (user.sign) {
            result.sign = user.sign;
        }
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

// gift order
// add gift order
exports.add_gift_order = function(req, res, next){
    var data = req.data;
    var userId = data['userId'];
    var addressId = data['addressId'];
    var giftId = data['giftId'] || [];
    var deliveryType = data['deliveryType'] || DELIVERYTYPE['SONGHUO'].id;
    var RSCId = data['RSCId'] || null;
    var consigneePhone = data['consigneePhone'] || null;
    var consigneeName = data['consigneeName'] || null;

    if (deliveryType && parseInt(deliveryType) === DELIVERYTYPE['SONGHUO'].id) {
        if (!addressId) {
            res.respond({"code":1001, "message":"请先填写收货地址"});
            return;
        }
    } else if (deliveryType && parseInt(deliveryType) === DELIVERYTYPE['ZITI'].id) {
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
                        res.respond({code:1000, message:'success', giftOrder:response});
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

// gift orders query
exports.json_gift_order_query = function(req, res, next) {
    var self = this;
    var page = U.parseInt(req.data.page, 1) - 1;
    var max = U.parseInt(req.data.max, 20);
    var options = {};
    if (req.data.userId)
        options.userid = req.data.userId;

    UserService.get(options, function (err, user) {
        // Error
        if (err) {
            console.error('F.rewardshop json_gift_order_query UserService get err:', err);
            res.respond({code: 1004, message: '获取积分兑换记录失败'});
            return;
        }
        if (!user) {
            res.respond({code: 1002, message: '没有查找到用户，获取积分兑换记录失败'});
            return;
        }
        LoyaltypointService.queryGiftOrders(user.id, null, req.data.type, null, null, page, max, function(err, giftorders, count, pageCount) {
            if (err) {
                res.respond({code:1002, message:'获取积分兑换记录失败'});
                return;
            }
            var results = [];
            giftorders.forEach(function(giftorder) {
                giftorder.orderStatus = LoyaltypointService.giftOrderStatus(giftorder);
                results.push(giftorder);
            });
            res.respond({code:1000, message:'success', datas:{giftorders:giftorders, total:count, pages:pageCount, page:page}});
        });
    });
}

// get gift order detail
exports.json_gift_order_detail = function(req, res, next) {
    var self = this;
    LoyaltypointService.getGiftOrder(req.data.orderId, req.data.userId, null, function(err, giftorder) {
        if (err) {
            res.respond({code:1002, message:'获取积分兑换记录失败'});
            return;
        }
        var result = giftorder.toObject();
        result.orderStatus = LoyaltypointService.giftOrderStatus(result);
        delete result._id;
        delete result.__v;
        res.respond({code:1000, message:'success', giftorder:result});
    });
}

// RSC gift order
exports.json_RSC_gift_order_query = function(req, res, next) {
    var self = this;
    var page = U.parseInt(req.data.page, 1) - 1;
    var max = U.parseInt(req.data.max, 20);
    var options = {};
    if (req.data.userId)
        options.userid = req.data.userId;

    UserService.get(options, function (err, RSC) {
        // Error
        if (err) {
            console.error('F.rewardshop json_RSC_gift_order_query UserService get err:', err);
            res.respond({code: 1004, message: '获取积分兑换记录失败'});
            return;
        }
        if (!RSC) {
            res.respond({code: 1002, message: '没有查找到用户，获取积分兑换记录失败'});
            return;
        }
        if (!RSC.isRSC) {
            res.respond({code: 1002, message: '用户没有权限获取兑换积分记录'});
            return;
        }
        LoyaltypointService.queryGiftOrders(null, RSC._id, req.data.type, null, req.data.search, page, max, function(err, giftorders, count, pageCount) {
            if (err) {
                console.error('F.rewardshop json_RSC_gift_order_query LoyaltypointService queryGiftOrders err:', err);
                res.respond({code:1002, message:'获取积分兑换记录失败'});
                return;
            }
            var results = [];
            giftorders.forEach(function(giftorder) {
                delete giftorder.deliveryCode;
                giftorder.orderStatus = LoyaltypointService.giftOrderStatus(giftorder);
                results.push(giftorder);
            });
            res.respond({code:1000, message:'success', datas:{giftorders:giftorders, total:count, pages:pageCount, page:page}});
        });
    });
}

exports.process_RSC_gift_order_self_delivery = function(req, res, next) {
    var orderId = req.data.orderId;
    var deliveryCode = req.data.code;
    var RSC = req.user;

    if (!orderId) {
        res.respond({code: 1001, message: '请先提供订单ID'});
        return;
    }

    if (!deliveryCode) {
        res.respond({code: 1001, message: '请先提供订单自提码'});
        return;
    }

    LoyaltypointService.getGiftOrder(orderId, null, RSC._id, function(err, giftOrder) {
        if (err) {
            console.error('F.rewardshop process_RSC_gift_order_self_delivery LoyaltypointService getGiftOrder err:', err);
            res.respond({code:1002, message:'获取积分兑换记录失败'});
            return;
        }
        if (!giftOrder) {
            res.respond({code:1001, message:'没有找到相应的积分兑换记录'});
            return;
        }
        if (deliveryCode.trim() != giftOrder.deliveryCode) {
            res.respond({code:1001, message:'自提码错误'});
            return;
        }

        var deliverStatus = 5; // 已收货
        LoyaltypointService.updateGiftOrder(orderId, null, deliverStatus, null, null, function(err, giftOrder) {
            if (err) {
                console.error('F.rewardshop process_RSC_gift_order_self_delivery LoyaltypointService updateGiftOrder err:', err);
                res.respond({code:1002, message:'自提失败'});
                return;
            }
            res.respond({code:1000, message:'success'});
        });
    });
}

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
    var prevurl = req.url_prefix + '/gift/';
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

// get reward shop rules
exports.view_rewardshop_rules = function (req, res, next) {
    var result = {title:"积分规则"};
    res.render(path.join(__dirname, '../views/F.rewardshop/rewardshopRules.html'),
        {
            result: result
        }
    );
};