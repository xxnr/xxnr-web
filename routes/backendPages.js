/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');

// rewardshop
router.get(F.config['manager-url']+'/rewardshop/rewardshop-gifts', middleware.get_backend_auth, controllers.Manager.rewardshop_gifts);
router.get(F.config['manager-url']+'/rewardshop/rewardshop-gifts-detail', middleware.get_backend_auth, controllers.Manager.rewardshop_gifts_detail);
router.get(F.config['manager-url']+'/rewardshop/rewardshop-points-logs', middleware.get_backend_auth, controllers.Manager.rewardshop_points_logs);
router.get(F.config['manager-url']+'/rewardshop/rewardshop-gifts-orders', middleware.get_backend_auth, controllers.Manager.rewardshop_gifts_orders);

// campaign
router.get(F.config.manager_url + '/campaigns', middleware.get_backend_auth, controllers.Manager.campaigns);
router.get(F.config.manager_url + '/campaign-detail', middleware.get_backend_auth, controllers.Manager.campaign_detail);
router.get(F.config.manager_url + '/campaign-detail-QA', middleware.get_backend_auth, controllers.Manager.campaign_detail_QA);
router.get(F.config.manager_url + '/campaign-detail-quiz', middleware.get_backend_auth, controllers.Manager.campaign_detail_quiz);

// nominate category
router.get(F.config.manager_url + '/pages/nominate-categories', middleware.get_backend_auth, controllers.Manager.nominate_categories);
router.get(F.config.manager_url + '/pages/nominate-category-detail', middleware.get_backend_auth, controllers.Manager.nominate_category_detail);

//// admin / manager
router.get(F.config['manager-url'], middleware.backend_auth, controllers.Manager.manager);
router.get(F.config['manager-url']+'/*', middleware.backend_auth, controllers.Manager.manager);

module.exports = router;