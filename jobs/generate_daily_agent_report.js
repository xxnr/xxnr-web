/*
 * Created by zhouxin on 2016/7/28.
 */
var config = require('../config');
var services = require('../services');
var DashboardService = services.dashboard;
var ReportUpdateTimeModel = require('../models').reportUpdateTime;
var utils = require('../common/utils');
const millisecondsInDay = 24*60*60*1000;
const concurrency = 20;

ReportUpdateTimeModel.findOne({}, function(err, updateTime){
    var lastModifyTime = new Date(config.serviceStartTime).getTime();
    if(updateTime && updateTime.dailyAgentReport) {
        lastModifyTime = new Date(updateTime.dailyAgentReport).add('h', -config.currentTimeZoneDiff).getTime();
    }

    var currentTime = new Date().add('h', -config.currentTimeZoneDiff).getTime();
    var dayDiff = parseInt(currentTime/millisecondsInDay) - parseInt(lastModifyTime/millisecondsInDay);
    var recordedCount = dayDiff;
    var batchGenerateAgentReport = function(i, max) {
        var promises = [];
        for (; i < max; i++) {
            promises.push(new Promise(function (resolve, reject) {
                DashboardService.generateDailyAgentReport(i + 1, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            }));
        }

        Promise.all(promises)
            .then(function () {
                if((dayDiff - max) > concurrency){
                    batchGenerateAgentReport(max, max + concurrency);
                } else if ((dayDiff - max) > 0) {
                    batchGenerateAgentReport(max, dayDiff);
                } else{
                    // all finished
                    ReportUpdateTimeModel.update({}, {$set: {dailyAgentReport: new Date()}}, {upsert: true}, function (err, numAffected) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        console.log('[', new Date(), '] generate daily agent report job success. ', recordedCount, 'days recorded');
                        process.exit(0);
                    });
                }
            })
            .catch(function (err) {
                console.log('[', new Date(), '] generate daily agent report job fail:', err);
                process.exit(0);
            })
    };

    if(dayDiff > concurrency){
        batchGenerateAgentReport(0, concurrency);
    } else{
        batchGenerateAgentReport(0, dayDiff);
    }
});
