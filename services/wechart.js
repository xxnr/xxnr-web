/**
 * Created by pepelu on 2016/8/3.
 */
var config = require('../config');
var tools = require('../common/tools');
var utils = require('../common/utils');
var wechart_config = config.wechart;
var crypto = require('crypto');
var WechartModel = require('../models').wechart;
var lockfile = require('proper-lockfile');
var path = require('path');

const keyFile = path.join(__dirname, '../resources/require_token_and_ticket');
const tempKeyFile = path.join(__dirname, '../tmp/require_token_and_ticket');

var WechartService = function(){
    var self = this;
    // copy key file to temp folder;
    //utils.copyFile(keyFile, tempKeyFile);
    lockfile.lock(keyFile, function (err, release) {
        if(!err) {
            console.info('process start to require token and ticket');
            self.refresh_access_token(function () {
                self.refresh_jsapi_ticket();
            });
        }
    })
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
        var expires_in = result.expires_in;
        WechartModel.findOneAndUpdate({}, {$set:{access_token:result.access_token, access_token_update_time:new Date(), access_token_expires_in:expires_in}}, {upsert:true}, function(err){
            if(err){
                console.error(err);
            }

            if(cb){
                cb();
            }

            setTimeout(function(){self.refresh_access_token()}, expires_in * 1000 * 2 / 3);
        })
    });
};

WechartService.prototype.refresh_jsapi_ticket = function(cb){
    var self = this;
    WechartModel.findOne({}, function(err, wechart) {
        if (err) {
            console.error(err);
            if(cb) {
                cb('error refresh ticket');
            }

            // retry 5 minutes later
            setTimeout(function () {
                self.refresh_jsapi_ticket()
            }, 5 * 60 * 1000);
            return;
        }

        var httpOptions = {
            protocol: wechart_config.require_jsapi_ticket_url.protocol,
            host: wechart_config.require_jsapi_ticket_url.hostname,
            path: wechart_config.require_jsapi_ticket_url.path + '?type=jsapi&access_token=' + wechart.access_token
        };
        tools.httpRequest({httpOptions: httpOptions}, function (err, result) {
            if (err) {
                console.error('refresh jsapi ticket error', err);
                if (cb) {
                    cb(err);
                }
                return;
            }

            result = JSON.parse(result);
            if (result.errcode) {
                console.error('refresh jsapi ticket error', result.errmsg);
                if (cb) {
                    cb(err);
                }
                return;
            }

            var expires_in = result.expires_in;
            WechartModel.findOneAndUpdate({}, {$set: {jsapi_ticket: result.ticket, jsapi_ticket_update_time:new Date(), jsapi_ticket_expires_in:expires_in}}, function (err) {
                if (err) {
                    console.error(err);
                }

                if (cb) {
                    cb();
                }

                setTimeout(function () {
                    self.refresh_jsapi_ticket()
                }, expires_in * 1000 * 2 / 3);
            })
        })
    })
};

WechartService.prototype.generate_basic_config = function(url, cb){
    var self = this;
    WechartModel.findOne({}, function(err, wechart){
        if(err){
            console.error(err);
            cb('error find ticket');
            return;
        }

        var ret = {
            jsapi_ticket: wechart.jsapi_ticket,
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
        cb(null, ret);
    })
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