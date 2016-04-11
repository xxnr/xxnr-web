/**
 * Created by pepelu on 2016/4/11.
 */
var express = require('express');
var router = express.Router();
var controllers = require('./controllers');
var path = require('path');
var middleware = require('./common/middleware');

// front end page
router.get('/', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/index.html'));});
router.get('/header', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/header'));});
router.get('/footer', function(req, res){res.sendFile(path.join(__dirname, './public/xxnr/footer'));});

// area address
router.get('/api/v2.0/area/getAreaList', controllers.Area.json_province_query);
router.post('/api/v2.0/area/getAreaList', controllers.Area.json_province_query);

module.exports = router;