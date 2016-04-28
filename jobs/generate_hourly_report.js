/**
 * Created by pepelu on 2016/4/27.
 */
var config = require('../config');
var services = require('../services');
var DashboardService = services.dashboard;
var ReportUpdateTimeModel = require('../models').reportUpdateTime;
var utils = require('../common/utils');
const millisecondsInHour = 60*60*1000;

ReportUpdateTimeModel.findOne({}, function(err, updateTime){
    var lastModifyTime = new Date(config.serviceStartTime).getTime();
    if(updateTime && updateTime.hourly) {
        lastModifyTime = new Date(updateTime.hourly).getTime();
    }

    var currentTime = new Date().getTime();
    var hourDiff = parseInt(currentTime/millisecondsInHour) - parseInt(lastModifyTime/millisecondsInHour);
    var recordedCount = hourDiff;
    var batchGenerateHourlyReport = function(i, max) {
        var promises = [];
        for (; i < max; i++) {
            promises.push(new Promise(function (resolve, reject) {
                DashboardService.generateHourlyReport(i + 1, function (err) {
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
                hourDiff = hourDiff - max;
                if(hourDiff > 10000){
                    batchGenerateHourlyReport(max, max + 10000);
                } else if (hourDiff > 0) {
                    batchGenerateHourlyReport(max, max + hourDiff);
                } else{
                    // all finished
                    ReportUpdateTimeModel.update({}, {$set: {hourly: new Date()}}, {upsert: true}, function (err, numAffected) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        console.log('[', new Date(), '] generate hourly report job success. ', recordedCount, 'hours recorded');
                        process.exit(0);
                    });
                }
            })
            .catch(function (err) {
                console.log('[', new Date(), '] generate hourly report job fail:', err);
                process.exit(0);
            })
    };

    if(hourDiff > 10000){
        batchGenerateHourlyReport(0, 10000);
    } else{
        batchGenerateHourlyReport(0, hourDiff);
    }
});
