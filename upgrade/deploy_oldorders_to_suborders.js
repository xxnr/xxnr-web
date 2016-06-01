/**
 * Created by zhouxin on 2015/12/29.
 */

require('total.js');
var OrderModel = require('../models/index').order;
var SUBORDERTYPE = require('../common/defs').SUBORDERTYPE;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var moment = require('moment');

// OrderModel.find({$or:[{payments:{$exists:true}},{subOrders:{$exists:true}}]}).sort({dateCreated:-1}).exec(function (err, orders) {
OrderModel.find({$or:[{payments:{$exists:false}},{subOrders:{$exists:false}}]}).sort({dateCreated:-1}).exec(function (err, orders) {
	if (err) {
		console.error('Finding orders have payments or subOrders err:', err);
		return;
	}
	console.log('All orders num:', orders.length)
	var count = 0;
    var promises = orders.map(function(order) {
        return new Promise(function(resolve, reject) {
			var setvalues = {};
			var suborderId = null;
			var paymentPrice = null;
			if (!order.subOrders || (order.subOrders && order.subOrders.length == 0)) {
				var subOrders = [];
				if (order.deposit && order.deposit !== order.price) {
					var deposit = {'id':U.GUID(10), 'price':order.deposit, 'type':SUBORDERTYPE.DEPOSIT, 'payStatus':order.payStatus};
					var balance = {'id':U.GUID(10), 'price':(order.price-order.deposit), 'type':SUBORDERTYPE.BALANCE, 'payStatus':PAYMENTSTATUS.UNPAID};
					subOrders.push(deposit);
					subOrders.push(balance);
					suborderId = deposit.id;
					paymentPrice = deposit.price;
				} else {
					var full = {'id':U.GUID(10), 'price':order.price, 'type':SUBORDERTYPE.FULL, 'payStatus': order.payStatus};
					subOrders.push(full);
					suborderId = full.id;
					paymentPrice = full.price;
				}
				if (subOrders && subOrders.length > 0) {
					setvalues.subOrders = subOrders;
				}
			} else {
				suborderId = order.subOrders[0].id;
				paymentPrice = order.subOrders[0].price;
			}
			if ((!order.payments || (order.payments && order.payments.length == 0)) && suborderId && paymentPrice) {
				var payments = [];
				var payment = {
					'id': order.paymentId,
			        'slice': 1,
			        'price': paymentPrice,
			        'suborderId': suborderId,
			        'dateCreated': order.dateCreated,
			        'payStatus': order.payStatus,
			        'payType': order.payType
		    	}
		    	if (order.payStatus == PAYMENTSTATUS.PAID) {
			    	if (order.datePaid) {
						payment.datePaid = order.datePaid;
					}
				}
				var dateCreated = moment(payment.dateCreated);
                var UTCNow = moment(new Date());
                var dayDiff = UTCNow.diff(dateCreated, 'days');
				if (dayDiff >= 3) {
					payment.isClosed = true;
				}
				payments.push(payment);
				setvalues.payments = payments;
			}

            if(setvalues && !U.isEmpty(setvalues)) {
            	// console.log(setvalues);
                OrderModel.update({_id: order._id}, {$set: setvalues}, function (err, numAffected) {
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
        })
    });

    Promise.all(promises)
        .then(function() {
            console.log('[', new Date(), ']', count, 'order(s) fixed in total');
    		process.exit(0);
        })
        .catch(function() {
            console.log('[', new Date(), ']', count, 'order(s) fixed in total');
            console.log('[', new Date(), ']', 'order(s) fixed err:', err);
    		process.exit(0);
        });

});