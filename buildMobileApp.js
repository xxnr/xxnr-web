/**
 * Created by pepelu on 2016/7/23.
 */
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer  = require('multer');
var path = require('path');
var express = require('express');

module.exports = function(app){

    app.disable('etag');
    app.set('jsonp callback name', 'JSON_CALLBACK');

//view template setting
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
    app.engine('html', require('ejs-mate'));

    /**
     * middleware
     */
    app.use(function (req, res, next) {
        if (req.headers['content-type']){
            req.headers['content-type'] = req.headers['content-type'].replace('charset=utf8', 'charset=utf-8');
        }

        // utf-8 is not a valid content-encoding while old android app will add this header improperly, so we need to remove them.
        if(req.headers['content-encoding'] && req.headers['content-encoding'].toLocaleLowerCase() === 'utf-8'){
            delete req.headers['content-encoding'];
        }

        // APP will add extra slash at the beginning of the path improperly, here to remove them
        req.path.replace(/\/*/, '/');

        // for nginx proxy
        req.clientIp = req.headers['x-real-ip'] || req.headers['ip'] || req.ip;
        return next();
    });

// bodyParser based on content type
    app.use(bodyParser.json({
        'limit': '1mb'
    }));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use('/', multer({ storage: multer.memoryStorage() }).any());

// cookieParser
    app.use(cookieParser());

// website common middleware
    app.use(require('./middlewares/website'));

    var routes = require('./routes');
// routes
    app.use('/', routes.secureFrontendApis);
    app.use('/', routes.frontendApis);
    app.use('/', routes.frontendPages);
    app.use('/', routes.appRelatedPages);
//app.use('/', routes.backendApis);
//app.use('/', routes.backendPages);
//app.use(/(^home\/|cars\/|huafei\/|my_xxnr\/|login\/|productDetail\/|order\/|orderRSC\/|orderConsignee\/|offlinePay\/|orderDone\/|selfDelivery\/|register\/|userAgreement\/|my_orders\/|my_points\/|my_invitation\/)/, function(req, res, next) {
//    res.sendFile(path.join(__dirname, '.'+ F.config.directory_xxnr_mobile_public + 'index.html'));
//});

// handle fallback for HTML5 history API
    app.use(require('connect-history-api-fallback')());

    app.use(function (err, req, res, next) {
        if(F.config.environment === 'production'){
            res.status(500);
            res.end();
            return;
        }

        next(err);
    });

    return app;
};