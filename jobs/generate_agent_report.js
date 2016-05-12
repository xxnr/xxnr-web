/**
 * Created by pepelu on 2016/5/4.
 */
var config = require('../config');
var services = require('../services');
var DashboardService = services.dashboard;
var ReportUpdateTimeModel = require('../models').reportUpdateTime;
var utils = require('../common/utils');
const millisecondsInDay = 24*60*60*1000;
const concurrency = 10000;

ReportUpdateTimeModel.findOne({}, function(err, updateTime){
    var lastModifyTime = new Date(config.serviceStartTime).getTime();
    if(updateTime && updateTime.agentReport) {
        lastModifyTime = new Date(updateTime.agentReport).getTime();
    }

    var currentTime = new Date().getTime();
    var dayDiff = parseInt(currentTime/millisecondsInDay) - parseInt(lastModifyTime/millisecondsInDay);
    var recordedCount = dayDiff;
    var batchGenerateAgentReport = function(i, max) {
        var promises = [];
        for (; i < max; i++) {
            promises.push(new Promise(function (resolve, reject) {
                DashboardService.generateAgentReport(i + 1, function (err) {
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
                dayDiff = dayDiff - max;
                if(dayDiff > concurrency){
                    batchGenerateAgentReport(max, max + concurrency);
                } else if (dayDiff > 0) {
                    batchGenerateAgentReport(max, max + dayDiff);
                } else{
                    // all finished
                    ReportUpdateTimeModel.update({}, {$set: {agentReport: new Date()}}, {upsert: true}, function (err, numAffected) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        console.log('[', new Date(), '] generate agent report job success. ', recordedCount, 'days recorded');
                        process.exit(0);
                    });
                }
            })
            .catch(function (err) {
                console.log('[', new Date(), '] generate agent report job fail:', err);
                process.exit(0);
            })
    };

    if(dayDiff > concurrency){
        batchGenerateAgentReport(0, concurrency);
    } else{
        batchGenerateAgentReport(0, dayDiff);
    }
});
