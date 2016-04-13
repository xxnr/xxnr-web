/**
 * Created by zhouxin on 2016/01/25.
 */
var tools = require('../common/tools');
var AuditLogModel = require('../models').auditlog;
var moment = require('moment-timezone');

// Service
var AuditService = function(){};

// Method
// audit info
AuditService.prototype.query = function(options, callback) {

    // options.search {String}
    // options.page {String or Number}
    // options.max {String or Number}

    // page max num
    var pagemax = 50;
    var max = U.parseInt(options.max, 20);
    options.page = U.parseInt(options.page) - 1;
    options.max = max > pagemax ? pagemax : max;

    if (options.page < 0)
        options.page = 0;

    var take = U.parseInt(options.max);
    var skip = U.parseInt(options.page * options.max);

    var query = {};

    if (options.status) {
    	if (options.status == 1) {
    		query.succeeded = true;
    	} else {
    		query.succeeded = false;
    	}
    }

    // Prepares searching
    if (options.search)
        query.$text = {$search:options.search};

    AuditLogModel.count(query, function (err, count) {
        if (err) {
            callback(err);
            return;
        }

        AuditLogModel.find(query, { __v: 0, parameters: 0 })
            .sort({dateCreated: -1})
            .skip(skip)
            .limit(take)
            .exec(function (err, docs) {
                if (err) {
                    callback(err);
                    return;
                }

                var data = {};
                data.count = count;
                data.items = docs;

                // Gets page count
                data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);
                if (data.pages === 0)
                    data.pages = 1;
                data.page = options.page + 1;

                // Returns data
                callback(null, data);
            });
    });
};

// Gets a specific new
AuditService.prototype.get = function(options, callback) {

    // Gets a specific document from DB
    var queryoptions = {};
    if (options.id)
        queryoptions._id = options.id;
    AuditLogModel.findOne(queryoptions, function(err, doc){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, doc);
    })
};

// audit info
AuditService.prototype.generateAuditInfo = function (url, method, ip, user, data) {
	if (controller) {
	    var auditInfo = {};
	    auditInfo.action = url;
	    auditInfo.actionMethod = method;
	    if (controller.user) {
	        auditInfo.actorName = user.account;
	        auditInfo.actorId = user._id;
	    } else {
	        auditInfo.actorName = null;
	        auditInfo.actorId = null;
	    }
	    auditInfo.actorIp = ip;
	    auditInfo.dateCreated = new Date();
	    if (data) {
	    	auditInfo.parameters = [];
	    	var keys = Object.keys(data);
	    	for (var i = 0; i < keys.length; i++) {
	    		var value = data[keys[i]];
	    		if (value instanceof Object) {
	    			value = JSON.stringify(value);
	    		}
	    		auditInfo.parameters.push({name:keys[i], value:value});
	    	}
	    }
	    return auditInfo;
	}
};

// save audit log
AuditService.prototype.saveLog = function (auditInfo, resultsList) {
	if (auditInfo) {
		if (resultsList && resultsList.length > 0) {
			var result = resultsList[0];
			if (result && result.code) {
				if (parseInt(result.code) === 1000) {
					auditInfo.succeeded = true;
				} else {
					auditInfo.succeeded = false;
				}
				auditInfo.resultCode = result.code;
			} else {
				if (result instanceof Array) {
					auditInfo.succeeded = false;
				}
			}
		}
		// Inserts order into the database
	    var audit = new AuditLogModel(auditInfo);
	    audit.save(function(err) {
			if (err) {
				console.error('Audit save log err:', err);
			}
		});
	}
};

module.exports = new AuditService();