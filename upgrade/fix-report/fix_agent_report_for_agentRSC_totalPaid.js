/**
 * Created by zhouxin on 2016/7/19.
 */
var config = require('../../config');
var AgentReportModel = require('../../models').agentReport;
var DashboardService = require('../../services').dashboard;
var utils = require('../../common/utils');
var moment = require('moment');
var U = require('../../common/utils');
var mongoose = require("mongoose");
const concurrency = 10;

// DashboardService.getOrderPaidAmountByAgent(new Date('2016-03-29 11:00:00'), mongoose.Types.ObjectId('5649bd6f8eba3c20360b0779'), function(err, count){
//     console.log(count);
// });

// AgentReportModel.find({dayInBeijingTime:'20151214'}).sort({dateTime:1}).exec(function(err, reports){
// AgentReportModel.find({agent: "5649bd6f8eba3c20360b079c"}).sort({dateTime:-1}).exec(function(err, reports){
AgentReportModel.find().sort({dateTime:-1}).exec(function(err, reports){
    if (err) {
        console.error('AgentReportModel find err:', err);
        return;
    }
    console.log('All AgentReportModel num:', reports.length);
    var count = 0;
    var dayDiff = reports.length;
    var result = [];
    var batchGenerateAgentReport = function(i, max) {
        var promisesreports = reports.slice(i, max);
        var promises = promisesreports.map(function(report) {
            return new Promise(function(resolve, reject) {
                var dayInBeijingTime = moment(report.dayInBeijingTime,"YYYYMMDD");
                var startTime = new Date(dayInBeijingTime.format('YYYY-MM-DD 00:00:00'));
                var endTime = new Date(dayInBeijingTime.add(1, 'd').format('YYYY-MM-DD 00:00:00'));
                var completedOrderCount = 0;
                var completedOrderPaidAmount = 0;
                var paidAmount = 0;
                var newAgentCount = 0;
                var newRSCCount = 0;

                var repostpromises = [
                    new Promise(function(resolve, reject){
                        DashboardService.getOrderPaidAmountByAgent(endTime.format('yyyyMMdd'), report.agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            paidAmount = count;
                            resolve();
                        })
                    })
                    , new Promise(function(resolve, reject){
                        DashboardService.getCompletedOrderCountByAgent(endTime.format('yyyyMMdd'), report.agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            completedOrderCount = count;
                            resolve();
                        })
                    })
                    , new Promise(function(resolve, reject){
                        DashboardService.getCompletedOrderPaidAmountByAgent(endTime.format('yyyyMMdd'), report.agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            completedOrderPaidAmount = count;
                            resolve();
                        })
                    })
                    , new Promise(function (resolve, reject) {
                        DashboardService.getNewAgentCountByAgent(endTime, report.agent, function (err, count) {
                            if (err) {
                                reject(err);
                                return;
                            }

                            newAgentCount = count;
                            resolve();
                        })
                    })
                    , new Promise(function (resolve, reject) {
                        DashboardService.getNewRSCCountByAgent(endTime, report.agent, function (err, count) {
                            if (err) {
                                reject(err);
                                return;
                            }

                            newRSCCount = count;
                            resolve();
                        })
                    })
                ];
                Promise.all(repostpromises)
                    .then(function () {
                        if (typeof report.totalCompletedOrderCount == 'undefined' || typeof report.totalCompletedOrderPaidAmount == 'undefined' || 
                            typeof report.totalPaidAmount == 'undefined' || typeof report.newAgentCount == 'undefined' || 
                            typeof report.newRSCCount == 'undefined' || report.totalCompletedOrderCount != completedOrderCount || 
                            report.totalCompletedOrderPaidAmount != completedOrderPaidAmount || report.totalPaidAmount != paidAmount || 
                            report.newAgentCount != newAgentCount || report.newRSCCount != newRSCCount) {
                            var setvalues = {totalCompletedOrderCount:completedOrderCount, totalCompletedOrderPaidAmount:completedOrderPaidAmount, 
                                totalPaidAmount:paidAmount, newAgentCount:newAgentCount, newRSCCount:newRSCCount};
                        // if (typeof report.newAgentCount == 'undefined' || typeof report.newRSCCount == 'undefined' || report.newAgentCount != newAgentCount || report.newRSCCount != newRSCCount) {
                        //     var setvalues = {newAgentCount:newAgentCount, newRSCCount:newRSCCount};
                            if(setvalues && !U.isEmpty(setvalues)) {

                                AgentReportModel.update({_id: report._id}, {$set: setvalues}, function (err, numAffected) {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                    count++;
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        } else {
                            resolve();
                        }
                    })
                    .catch(function (err) {
                        reject(err);
                        return;
                    });
            });
        });
        Promise.all(promises)
            .then(function () {
                if((dayDiff - max) > concurrency){
                    batchGenerateAgentReport(max, max + concurrency);
                } else if ((dayDiff - max) > 0) {
                    batchGenerateAgentReport(max, max + (dayDiff - max));
                } else{
                    console.log('[', new Date(), ']', count, 'agent report(s) fixed in total');
                    process.exit(0);
                }
            })
            .catch(function (err) {
                console.log('[', new Date(), ']', count, 'agent report(s) fixed in total');
                console.log('[', new Date(), ']', 'agent report(s) fixed err:', err);
                process.exit(0);
            });
    };

    if(dayDiff > concurrency){
        batchGenerateAgentReport(0, concurrency);
    } else{
        batchGenerateAgentReport(0, dayDiff);
    }
});
