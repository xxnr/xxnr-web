/**
 * Created by zhouxin on 2016/7/19.
 */
var config = require('../../config');
var HourlyReportModel = require('../../models').hourlyReport;
var DashboardService = require('../../services').dashboard;
var utils = require('../../common/utils');
var moment = require('moment');
var U = require('../../common/utils');

// HourlyReportModel.find({hourInBeijingTime:'2015121411'}).sort({dateTime:1}).exec(function(err, reports){
HourlyReportModel.find({}).sort({dateTime:1}).exec(function(err, reports){

    if (err) {
        console.error('HourlyReportModel find err:', err);
        return;
    }
    console.log('All HourlyReportModel num:', reports.length);

    var count = 0;
    var result = [];
    var promises = reports.map(function(report) {
        return new Promise(function(resolve, reject) {
            var hourInBeijingTime = moment(report.hourInBeijingTime,"YYYYMMDDHH");
            var startTime = new Date(hourInBeijingTime.format('YYYY-MM-DD HH:00:00'));
            var endTime = new Date(hourInBeijingTime.add(1, 'h').format('YYYY-MM-DD HH:00:00'));
            var agentVerifiedCount = 0;
            var RSCVerifiedCount = 0;

            var repostpromises = [
                new Promise(function (resolve, reject) {
                    DashboardService.getAgentVerifiedCount(startTime, endTime, function (err, count) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        agentVerifiedCount = count;
                        resolve();
                    })
                })
                , new Promise(function (resolve, reject) {
                    DashboardService.getRSCVerifiedCount(startTime, endTime, function (err, count) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        RSCVerifiedCount = count;
                        resolve();
                    })
                })
            ];
            Promise.all(repostpromises)
                .then(function () {
                    if (typeof report.agentVerifiedCount == 'undefined' || typeof report.RSCVerifiedCount == 'undefined' || report.agentVerifiedCount != agentVerifiedCount || report.RSCVerifiedCount != RSCVerifiedCount) {
                        var setvalues = {agentVerifiedCount:agentVerifiedCount, RSCVerifiedCount:RSCVerifiedCount};
                        if(setvalues && !U.isEmpty(setvalues)) {
                            HourlyReportModel.update({_id: report._id}, {$set: setvalues}, function (err, numAffected) {
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
        .then(function() {
            console.log('[', new Date(), ']', count, 'hourly report(s) fixed in total');
            process.exit(0);
        })
        .catch(function(err) {
            console.log('[', new Date(), ']', count, 'hourly report(s) fixed in total');
            console.log('[', new Date(), ']', 'hourly report(s) fixed err:', err);
            process.exit(0);
        });
});
