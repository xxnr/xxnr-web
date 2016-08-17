/**
 * Created by pepelu on 2016/4/11.
 */
var services = require('../services');
var AuditService = services.auditservice;
var path = require('path');
var URL = require('url');
var tools = require('../common/tools');
var config = require('../config');
module.exports = function(req, res, next) {
    req.data = req.method == 'GET' ? req.query : req.body;
    res.jsonp = function (obj, name) {
        var val = obj;

        // settings
        var app = req.app;
        var replacer = app.get('json replacer');
        var spaces = app.get('json spaces');
        var body = JSON.stringify(val, replacer, spaces);
        var callback = name;

        // content-type
        if (!this.get('Content-Type')) {
            this.set('X-Content-Type-Options', 'nosniff');
            this.set('Content-Type', 'application/json');
        }

        // fixup callback
        if (Array.isArray(callback)) {
            callback = callback[0];
        }

        // jsonp
        if (typeof callback === 'string' && callback.length !== 0) {
            this.charset = 'utf-8';
            this.set('X-Content-Type-Options', 'nosniff');
            this.set('Content-Type', 'text/javascript');

            // restrict callback charset
            callback = callback.replace(/[^\[\]\w$.]/g, '');

            // replace chars not allowed in JavaScript that are in JSON
            body = body
                .replace(/\u2028/g, '\\u2028')
                .replace(/\u2029/g, '\\u2029');

            // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
            // the typeof check is just to reduce client error noise
            body = callback + '(' + body + ');';
        }

        this.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        return res.send(body);
    };

    res.json = function(obj){
        var val = obj;

        // allow status / body
        if (arguments.length === 2) {
            // res.json(body, status) backwards compat
            if (typeof arguments[1] === 'number') {
                deprecate('res.json(obj, status): Use res.status(status).json(obj) instead');
                this.statusCode = arguments[1];
            } else {
                deprecate('res.json(status, obj): Use res.status(status).json(obj) instead');
                this.statusCode = arguments[0];
                val = arguments[1];
            }
        }

        // settings
        var app = this.app;
        var replacer = app.get('json replacer');
        var spaces = app.get('json spaces');
        var body = JSON.stringify(val, replacer, spaces);

        // content-type
        if (!this.get('Content-Type')) {
            this.set('Content-Type', 'application/json');
        }

        this.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        return this.send(body);
    };

    res.respond = function (data) {
        res.status(200);

        var callbackName = req.data.callback;
        if (!res.finished) {
            callbackName ? res.jsonp(data, callbackName) : res.json(data);

            if (req.auditInfo) {
                AuditService.saveLog(req.auditInfo, arguments);
            }
        }
    };

    var allowcache = req.get('pragma') !== 'no-cache';
    if (path.extname(req.path) === 'html') {
        res.set('Pragma', 'no-cache');
        res.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

        if (RELEASE && allowcache && !res.get('Expires'))
            res.set('Expires', new Date());
    }
    else if (path.extname(req.path) === 'js' || path.extname(req.path) === 'css') {
        res.set('Cache-Control', 'public' + (RELEASE && allowcache ? ', max-age=5184000' : ''));
        if (RELEASE && allowcache && !res.get('Expires'))
            res.set('Expires', new Date().add('M', 2));
    }

    buildURLPrefix(req);
    getFullURL(req);
    next();
};

function buildURLPrefix(req){
    var urlObject = URL.parse(req.protocol + '://' + req.get('host'));
    var port = urlObject.port;
    if (port == '80' || port == '443' || config.environment == 'sandbox') {
        port = undefined;
    }

    var hosturl = req.hostname;
    if (hosturl) {
        hosturl = tools.getXXNRHost(hosturl);
    } else {
        hosturl = 'www.xinxinnongren.com';
    }

    var webhosturl = req.hostname;
    if(webhosturl){
        webhosturl = tools.getXXNRWebHost(webhosturl)
    } else{
        webhosturl = 'www.xinxinnongren.com';
    }

    var protocol = req.protocol + '://';
    req.url_prefix = protocol + hosturl + (port ? ':' + port : '');
    req.web_url_prefix = protocol + webhosturl + (port ? ':' + port : '');
}

function getFullURL(req){
    req.full_URL_without_hash = req.protocol + '://' + req.get('host') + req.originalUrl;
}