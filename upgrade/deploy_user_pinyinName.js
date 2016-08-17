/**
 * Created by zhouxin on 2016/04/08.
 */

require('total.js');
var UserModel = require('../models/index').user;
var pinyin = require('pinyin');
var tools = require('../common/tools');

UserModel.find({}).sort({datecreated:-1}).exec(function (err, users) {
	if (err) {
		console.error('Finding UserModel err:', err);
		return;
	}
	console.log('All users num:', users.length)
	var count = 0;
	var promises = users.map(function(user) {
        return new Promise(function(resolve, reject) {
        	var setvalues = {};
        	var name = user.name;
            if (name) {
                var result = tools.stringPinyin({'str':name});
                if (result) {
                    if (result.error)
                        reject(result.error);
                        // console.error('update name stringPinyin error:', result.error, name);
                    if (result.strPinyin)
                        setvalues.namePinyin = result.strPinyin;
                    if (result.initial)
                        setvalues.nameInitial = result.initial;
                    if (result.initialType)
                        setvalues.nameInitialType = result.initialType;
                }
            } else {
                setvalues.namePinyin = '#';
                setvalues.nameInitial = '#';
                setvalues.nameInitialType = 2;
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
            console.log('[', new Date(), ']', count, 'users(s) fixed in total');
    		process.exit(0);
        })
        .catch(function(err) {
            console.log('[', new Date(), ']', count, 'users(s) fixed in total');
            console.log('[', new Date(), ']', 'users(s) fixed err:', err);
    		process.exit(0);
        });
});