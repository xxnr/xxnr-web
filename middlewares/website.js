/**
 * Created by pepelu on 2016/4/11.
 */
var services = require('../services');
var AuditService = services.auditservice;
var path = require('path');
module.exports = function(req, res, next){
    req.data = req.method == 'GET'? req.query : req.body;

    res.jsonp = function(obj, name){
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

        return res.send(body);
    };

    res.respond = function(data) {
        res.status(200);

        var callbackName = req.data.callback;
        if(!res.finished) {
            callbackName ? res.jsonp(data, callbackName) : res.json(data);

            if (req.auditInfo) {
                AuditService.saveLog(req.auditInfo, arguments);
            }
        }
    };

    var allowcache = req.get('pragma') !== 'no-cache';
    if(path.extname(req.path) === 'html') {
        res.set('Pragma', 'no-cache');
        res.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

        if (RELEASE && allowcache && !res.get('Expires'))
            res.set('Expires', new Date());
    }
    else if(path.extname(req.path) === 'js' || path.extname(req.path) === 'css') {
        res.set('Cache-Control', 'public' + (RELEASE && allowcache ? ', max-age=5184000' : ''));
        if (RELEASE && allowcache && !res.get('Expires'))
            res.set('Expires', new Date().add('M', 2));
    }

    next();
};