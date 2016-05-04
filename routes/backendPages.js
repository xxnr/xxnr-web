/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');

//// admin / manager
router.get('/manager', middleware.backend_auth ,controllers.Manager.manager);
router.get('/manager/*', middleware.backend_auth ,controllers.Manager.manager);

module.exports = router;