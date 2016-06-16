/**
 * Created by zhouxin on 2016/06/15.
 */
var path = require('path');
var tools = require('../common/tools');
var moment = require('moment-timezone');
var services = require('../services');
var UserService = services.user;
var LoyaltypointService = services.loyaltypoint;

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
        var result = {};
        result.score = user.score;
        result.sign = user.sign;
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
			delete gift.appbody;
			resultGifts.push(convertGift(gift));
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
        
		res.respond({code:1000, message:'success', gift: convertGift(gift)});
	});
}

function convertGift(gift) {
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