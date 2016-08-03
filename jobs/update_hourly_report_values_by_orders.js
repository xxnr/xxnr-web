/*
 * Created by zhouxin on 2016/7/29.
 */
var U = require('../common/utils');
var config = require('../config');
var OrderModel = require('../models/index').order;
var HourlyReportModel = require('../models').hourlyReport;
var services = require('../services');
var UserService = services.user;
var DashboardService = services.dashboard;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var moment = require('moment');

console.log('[', new Date(), '] Start update hourly reports values...');
UserService.getTestAccountList(function(err, testAccountList) {
    if (err) {
        console.error('Finding get test account list err:', err);
        return;
    }

    var querier = {buyerId:{$nin:testAccountList}};
	OrderModel.find(querier).sort({dateCreated:-1}).exec(function (err, orders) {
		if (err) {
			console.error('Finding orders err:', err);
			return;
		}
		console.log('All orders num:', orders.length);

		var hourlyReports = {};
		orders.map(function(order) {
			var result = getReport(order);
			var hourInBeijingTime = new Date(order.dateCreated.format('yyyy-MM-dd hh')+':00:00').format('yyyyMMddHH');
			var key = hourInBeijingTime;
			initReport(hourlyReports, key);
			if (result.orderCount) {
				hourlyReports[key].orderCount += 1;
			}
			if (result.paidOrderCount) {
				hourlyReports[key].paidOrderCount += 1;
				hourlyReports[key].paidAmount += result.paidAmount;
			}
			if (result.completedOrderCount) {
				hourlyReports[key].completedOrderCount += 1;
				hourlyReports[key].completedOrderPaidAmount += result.completedOrderPaidAmount;
			}
		});
		var keys =  Object.keys(hourlyReports);
		console.log('All hourlyReports num:', keys.length);
		// update hourlyReports
		var promises = [];
		var hours = [];
		for (var i=0; i < keys.length; i++) {
			var key = keys[i];
			hours.push(key);
			promises.push(new Promise(function (resolve, reject) {
	            DashboardService.updateHourlyReportByOrder(key, hourlyReports[keys[i]], function(err, hourInBeijingTime, hourlyReport) {
	            	if (err) {
	                    reject(err, hourInBeijingTime, hourlyReport);
	                    return;
	                }
	                resolve();
				});
			}));
		}
		Promise.all(promises)
	    .then(function () {
	    	// update other hourlyReports to 0
			promises = [];
			var initHourlyReport = {
				orderCount: 0,
			    paidOrderCount: 0,
			    paidAmount: 0,
			    completedOrderCount: 0,
			    completedOrderPaidAmount: 0
			};
			
			HourlyReportModel.findOneAndUpdate({hourInBeijingTime:{$nin:hours}}, {$set:initHourlyReport}, function(err){
				if(err){
					console.error('[', new Date(), '] update other hourly reports job fail:', err);
					process.exit(0);
				}
				console.log('[', new Date(), '] All Hourly Report Update End...');
			});
	    })
	    .catch(function (err, hourInBeijingTime, hourlyReport) {
	        console.error('[', new Date(), '] update hourly report job fail:', err, 'value:', {'hourInBeijingTime':hourInBeijingTime, 'hourlyReport':hourlyReport});
	        process.exit(0);
	    });
	});
});

function initReport(hourlyReports, key) {
	if (!hourlyReports[key]) {
		hourlyReports[key] = {
			orderCount: 0,
		    paidOrderCount: 0,
		    paidAmount: 0,
		    completedOrderCount: 0,
		    completedOrderPaidAmount: 0
		};
	}
}

function getReport(order) {
	var result = {
		orderCount: false,
	    paidOrderCount: false,
	    paidAmount: 0,
	    completedOrderCount: false,
	    completedOrderPaidAmount: 0
	}
	result.orderCount = true;
	if (order.payStatus != PAYMENTSTATUS.UNPAID) {
		result.paidOrderCount = true;
		if (order.depositPaid) {
			result.paidAmount = parseFloat((order.price - order.duePrice).toFixed(2));
		} else {
			if (order.deposit > 0) {
				result.paidAmount = parseFloat((order.deposit - order.duePrice).toFixed(2));
			} if (order.deposit == 0) {
				result.paidAmount = parseFloat((order.price - order.duePrice).toFixed(2));
			}
		}
	}
	if (order.deliverStatus == DELIVERSTATUS.RECEIVED) {
		result.completedOrderCount = true;
		result.completedOrderPaidAmount = parseFloat((order.price).toFixed(2));
	}
	return result;
}