/**
 * Created by zhouxin on 2016/04/08.
 */

require('total.js');
var PotentialCustomerModel = require('../models').potential_customer;
var pinyin = require('pinyin');

PotentialCustomerModel.find({}).sort({dateTimeAdded:-1}).exec(function (err, customers) {
	if (err) {
		console.error('Finding PotentialCustomerModel err:', err);
		return;
	}
	console.log('All customers num:', customers.length)
	var count = 0;
	var promises = customers.map(function(customer) {
        return new Promise(function(resolve, reject) {
        	var setvalues = {};
        	var name = customer.name;
        	var namePinyin = '#';
		    var nameInitial = '#';
		    try {
		        var namePinyinList = pinyin(name, {style: pinyin.STYLE_NORMAL});
		        namePinyin = namePinyinList.join("").toLowerCase();
		        var char = namePinyin[0];
		        var regs=/^[A-Z-a-z]$/;
		        if(regs.test(char)) {
		            nameInitial = char.toUpperCase();
		        } else {
		            namePinyin = nameInitial + namePinyin;
		        }
		        setvalues.nameInitial = nameInitial;
		        setvalues.namePinyin = namePinyin;
		    } catch (e) {
		        var err = 'PotentialCustomerService pinyin err:' + e + ' name:' + name;
		        reject(err);
		    }
		    if(setvalues && !U.isEmpty(setvalues)) {
            	// console.log(setvalues);
                PotentialCustomerModel.update({_id: customer._id}, {$set: setvalues}, function (err, numAffected) {
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
            console.log('[', new Date(), ']', count, 'customers(s) fixed in total');
    		process.exit(0);
        })
        .catch(function() {
            console.log('[', new Date(), ']', count, 'customers(s) fixed in total');
            console.log('[', new Date(), ']', 'customers(s) fixed err:', err);
    		process.exit(0);
        });
});