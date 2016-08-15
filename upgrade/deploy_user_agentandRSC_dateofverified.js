/**
 * Created by zhouxin on 2016/7/18.
 */

var UserModel = require('../models/index').user;
var tools = require('../common/tools');
var moment = require('moment');
var config = require('../config');
var U = require('../common/utils');

UserModel.find({typeVerified: { $in: [config.XXNRAgentId, config.RSCId] } }).sort({datecreated:-1}).exec(function (err, users) {
	if (err) {
		console.error('Finding UserModel err:', err);
		return;
	}
	console.log('All agent/RSC users num:', users.length);
	var count = 0;
	var promises = users.map(function(user) {
        return new Promise(function(resolve, reject) {
        	var setvalues = {};
            if (user && user.typeVerified) {
                if (tools.isXXNRAgent(user.typeVerified)) {
		            if (!user.dateTypeVerified || !user.dateTypeVerified.dateFirstAgent) {
		                setvalues['dateTypeVerified.dateFirstAgent'] = user.datecreated;
		            }
		            if (!user.dateTypeVerified || !user.dateTypeVerified.dateAgent) {
		            	setvalues['dateTypeVerified.dateAgent'] = user.datecreated;
		            }
		        }
		        if (tools.isRSC(user.typeVerified)) {
		            if (!user.dateTypeVerified || !user.dateTypeVerified.dateFirstRSC) {
		                setvalues['dateTypeVerified.dateFirstRSC'] = user.datecreated;
		            }
		            if (!user.dateTypeVerified || !user.dateTypeVerified.dateRSC) {
		            	setvalues['dateTypeVerified.dateRSC'] = user.datecreated;
		            }
		        }
            }
		    if(setvalues && !U.isEmpty(setvalues)) {
            	// console.log(setvalues);
                UserModel.update({_id: user._id}, {$set: setvalues}, function (err, numAffected) {
                	if (err) {
                		// console.log(err);
                		reject(err);
                        return;
                    }
                    count++;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
    Promise.all(promises)
        .then(function() {
            console.log('[', new Date(), ']', count, 'users(s) add Date in total');
    		process.exit(0);
        })
        .catch(function(err) {
            console.log('[', new Date(), ']', count, 'users(s) add Date in total');
            console.log('[', new Date(), ']', 'users(s) fixed err:', err);
    		process.exit(0);
        });
});