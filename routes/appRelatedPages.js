/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');

// app related pages
router.get('/product/:productInfo/:productId/',controllers.Api_v1_0.view_product_info);
router.get('/news/:id/',controllers.News.view_news_detail);
router.get('/sharenews/:id/',controllers.News.view_newsshare_detail);

// rewardshop
router.get('/gift/:giftInfo/:giftId/',controllers.Rewardshop.view_gift_info);

module.exports = router;