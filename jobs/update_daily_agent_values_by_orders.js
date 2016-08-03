/*
 * Created by zhouxin on 2016/7/29.
 */
var U = require('../common/utils');
var config = require('../config');
var OrderModel = require('../models/index').order;
var UserModel = require('../models/index').user;
var DailyAgentReportModel = require('../models').dailyAgentReport;
var services = require('../services');
var UserService = services.user;
var DashboardService = services.dashboard;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var moment = require('moment');

console.log('[', new Date(), '] Start update daily agent reports values by orders...');
UserService.getTestAccountList(function(err, testAccountList) {
    if (err) {
        console.error('Finding get test account list err:', err);
        return;
    }

    var querier = {buyerId:{$nin:testAccountList}};
	OrderModel.find(querier).sort({dateCreated:-1}).exec(function (err, orders) {
		if (err) {
			console.error('Finding orders are not test err:', err);
			return;
		}
		console.log('All not test orders num:', orders.length);

		var userIds = [];
		var users = {};
		orders.map(function(order) {
			if (!users[order.buyerId]) {
				users[order.buyerId] = {};
				userIds.push(order.buyerId);
			}
		});
		UserModel.find({id:{$in:userIds}, inviter:{$exists: true}}).populate({path:'inviter', select:'_id id name account'}).exec(function (err, docs) {
			if (err) {
				console.error('Finding orders users err:', err);
				return;
			}
			docs.map(function(user) {
				users[user.id] = {inviter: user.inviter, dateinvited: user.dateinvited, _id: user._id};
			});
			var agentDailyReports = {};
			orders.map(function(order) {
				var userId = order.buyerId;
				if (users && users[userId] && !U.isEmpty(users[userId])) {
					var user = users[userId];
					var result = getAgentReport(order, user);
					var agent_id = user.inviter._id;
					var createDate = new Date(order.dateCreated.format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff).format('yyyyMMdd');
					var key1 = agent_id + '-' + createDate;
					initAgentReport(agentDailyReports, key1, user);
					if (result.newOrderCount) {
						agentDailyReports[key1].newOrderCount += 1;
					}
					if (result.newOrderCompletedCount) {
						agentDailyReports[key1].newOrderCompletedCount += 1;
						agentDailyReports[key1].newOrderCompletedPaidAmount += result.newOrderCompletedPaidAmount;
					}
					if (result.newOrderPaidCount) {
						agentDailyReports[key1].newOrderPaidCount += 1;
						agentDailyReports[key1].newOrderCompletedPaidAmount += result.newOrderCompletedPaidAmount;
					}
					if (order.dateCompleted && order.deliverStatus == DELIVERSTATUS.RECEIVED) {
						var completedDate = new Date(order.dateCompleted.format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff).format('yyyyMMdd');
						var key2 = agent_id + '-' + completedDate;
						initAgentReport(agentDailyReports, key2, user);
						if (result.completedOrderCount) {
							agentDailyReports[key2].completedOrderCount += 1;
							agentDailyReports[key2].completedOrderPaidAmount += result.completedOrderPaidAmount;
						}
					}
				}
			});
			var keys =  Object.keys(agentDailyReports);
			console.log('All agentDailyReports num:', keys.length);
			// update dailyAgentReports
			var agents = {};
			var errorList = {};
			var promises = [];
			for (var i=0; i < keys.length; i++) {
				var key = keys[i];
				var keyValues = key.split('-');
				var agentId = keyValues[0];
				var dayInBeijingTime = keyValues[1];
				if (!agents[agentId]) {
					agents[agentId] = {name: agentDailyReports[keys[i]].name, phone: agentDailyReports[keys[i]].phone};
					agents[agentId].dates = [];
				}
				agents[agentId].dates.push(dayInBeijingTime);
				promises.push(new Promise(function (resolve, reject) {
	                DashboardService.updateDailyAgentReportByOrder(agentId, dayInBeijingTime, agentDailyReports[keys[i]], function(err, agentId, dayInBeijingTime, agentDailyReport) {
	                	if (err) {
	                        reject(err, agentId, dayInBeijingTime, agentDailyReport);
	                        return;
	                    }

	                    resolve();
					});
        		}));
			}
			Promise.all(promises)
            .then(function () {
            	// update other dailyAgentReports to 0
				var agentIds = Object.keys(agents);
				promises = [];
				var initDailyAgentReport = {
					newOrderCount: 0,
				    newOrderCompletedCount: 0,
				    newOrderCompletedPaidAmount: 0,
				    newOrderPaidCount: 0,
				    newOrderPaidAmount: 0,
				    completedOrderCount: 0,
				    completedOrderPaidAmount: 0
				};
				for (i=0; i < agentIds.length; i++) {
					var agentId = agentIds[i];
					initDailyAgentReport.name = agents[agentId].name;
					initDailyAgentReport.phone = agents[agentId].phone;
					promises.push(new Promise(function (resolve, reject) {
						DailyAgentReportModel.findOneAndUpdate({agent:agentId, dayInBeijingTime:{$nin:agents[agentId].dates}}, {$set:initDailyAgentReport}, function(err){
							if(err){
								reject(err, agentId);
								return;
							}
							resolve();
						})
					}));
				}
				Promise.all(promises)
				.then(function () {
					console.log('[', new Date(), '] All AgentReport Update End...');
					require('./generate_agent_report.js');
				})
				.catch(function (err, agentId) {
					console.error('[', new Date(), '] update other daily agent reports job fail:', err, 'agentId:', agentId);
					process.exit(0);
				});
            })
            .catch(function (err, agentId, dayInBeijingTime, agentDailyReport) {
                console.error('[', new Date(), '] update daily agent report job fail:', err, 'value:', {'agentId':agentId, 'dayInBeijingTime':dayInBeijingTime, 'agentDailyReport':agentDailyReport});
                process.exit(0);
            });
		});
	});
});

function initAgentReport(agentDailyReports, key, user) {
	if (!agentDailyReports[key]) {
		agentDailyReports[key] = {
			name: user.inviter.name,
			phone: user.inviter.account,
			newOrderCount: 0,
		    newOrderCompletedCount: 0,
		    newOrderCompletedPaidAmount: 0,
		    newOrderPaidCount: 0,
		    newOrderPaidAmount: 0,
		    completedOrderCount: 0,
		    completedOrderPaidAmount: 0
		};
	}
}

function getAgentReport(order, user) {
	var result = {
		newOrderCount: false,
	    newOrderCompletedCount: false,
	    newOrderCompletedPaidAmount: 0,
	    newOrderPaidCount: false,
	    newOrderPaidAmount: 0,
	    completedOrderCount: false,
	    completedOrderPaidAmount: 0
	}
	if (user.dateinvited && new Date(order.dateCreated) >= new Date(user.dateinvited)) {
		result.newOrderCount = true;
		if (order.payStatus != PAYMENTSTATUS.UNPAID) {
			result.newOrderPaidCount = true;
			if (order.depositPaid) {
				result.newOrderPaidAmount = parseFloat((order.price - order.duePrice).toFixed(2));
			} else {
				if (order.deposit > 0) {
					result.newOrderPaidAmount = parseFloat((order.deposit - order.duePrice).toFixed(2));
				} if (order.deposit == 0) {
					result.newOrderPaidAmount = parseFloat((order.price - order.duePrice).toFixed(2));
				}
			}
		}
		if (order.deliverStatus == DELIVERSTATUS.RECEIVED) {
			result.newOrderCompletedCount = true;
			result.newOrderCompletedPaidAmount = parseFloat((order.price).toFixed(2));
		}
	}
	if (order.deliverStatus == DELIVERSTATUS.RECEIVED) {
		if (user.dateinvited) {
			if (order.dateCompleted && new Date(order.dateCompleted) >= new Date(user.dateinvited)) {
				result.completedOrderCount = true;
				result.completedOrderPaidAmount = parseFloat((order.price).toFixed(2));
			}
		} else {
			result.completedOrderCount = true;
			result.completedOrderPaidAmount = parseFloat((order.price).toFixed(2));
		}
	}
	return result;
}