/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');

// rewardshop
router.get(F.config['manager-url']+'/rewardshop/rewardshop-gifts', middleware.backend_auth, controllers.Manager.rewardshop_gifts);
router.get(F.config['manager-url']+'/rewardshop/rewardshop-gifts-detail', middleware.backend_auth, controllers.Manager.rewardshop_gifts_detail);
router.get(F.config['manager-url']+'/rewardshop/rewardshop-points-logs', middleware.backend_auth, controllers.Manager.rewardshop_points_logs);
router.get(F.config['manager-url']+'/rewardshop/index', middleware.backend_auth ,controllers.Manager.rewardshop);

//// admin / manager
router.get(F.config['manager-url'], middleware.backend_auth ,controllers.Manager.manager);
router.get(F.config['manager-url']+'/*', middleware.backend_auth ,controllers.Manager.manager);

module.exports = router;