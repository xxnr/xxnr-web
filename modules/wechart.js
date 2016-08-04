/**
 * Created by pepelu on 2016/8/3.
 */
var config = require('../config');
var tools = require('../common/tools');
var utils = require('../common/utils');
var wechart_config = config.wechart;
var crypto = require('crypto');

var WechartService = function(){
    var self = this;
    this.access_token = '';
    this.jsapi_ticket = '';
    self.refresh_access_token(function(){
        self.refresh_jsapi_ticket();
    });
};

WechartService.prototype.refresh_access_token = function(cb){
    var self = this;
    var httpOptions = {
        protocol:wechart_config.require_token_url.protocol,
        host: wechart_config.require_token_url.hostname,
        path: wechart_config.require_token_url.path + '?grant_type=client_credential&appid=' + wechart_config.app_id + '&secret=' + wechart_config.app_secret
    };
    tools.httpRequest({httpOptions:httpOptions}, function(err, result){
        if(err){
            console.error('refresh access token error', err);
            if(cb){
                cb(err);
            }
            return;
        }

        result = JSON.parse(result);
        self.access_token = result.access_token;
        var expires_in = result.expires_in;
        if(cb){
            cb();
        }

        setTimeout(function(){self.refresh_access_token()}, expires_in * 1000 * 2 / 3);
    });
};

WechartService.prototype.refresh_jsapi_ticket = function(cb){
    var self = this;
    var httpOptions = {
        protocol:wechart_config.require_jsapi_ticket_url.protocol,
        host: wechart_config.require_jsapi_ticket_url.hostname,
        path:wechart_config.require_jsapi_ticket_url.path + '?type=jsapi&access_token=' + self.access_token
    };
    tools.httpRequest({httpOptions:httpOptions}, function(err, result){
        if(err){
            console.error('refresh jsapi ticket error', err);
            if(cb){
                cb(err);
            }
            return;
        }

        result = JSON.parse(result);
        if(result.errcode){
            console.error('refresh jsapi ticket error', result.errmsg);
            if(cb){
                cb(err);
            }
            return;
        }

        self.jsapi_ticket = result.ticket;
        var expires_in = result.expires_in;
        if(cb){
            cb(null);
        }

        setTimeout(function(){self.refresh_jsapi_ticket()}, expires_in * 1000 * 2 / 3);
    })
};

WechartService.prototype.generate_basic_config = function(url){
    var self = this;
    var ret = {
        jsapi_ticket: self.jsapi_ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url: url
    };
    var string = raw(ret);
    var jsSHA = require('jssha');
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(string);
    ret.signature = shaObj.getHash('HEX');
    delete ret.jsapi_ticket;
    return ret;
};

module.exports = new WechartService();

var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};